"""Post CRUD endpoints: create (with NSFW gate), list, get, like, delete."""
import os
import uuid
import logging
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from pydantic import BaseModel, Field, ConfigDict

import media as media_service

logger = logging.getLogger(__name__)

# Max file size: 20 MB for images, larger for videos but we'll use images for MVP
MAX_FILE_BYTES = 20 * 1024 * 1024
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class PostPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    post_id: str
    author_id: str
    author_name: Optional[str] = None
    author_handle: Optional[str] = None
    author_avatar: Optional[str] = None
    author_verified: bool = False
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # 'image' | 'video' | None
    likes: int = 0
    comments: int = 0
    tips: int = 0
    liked_by_me: bool = False
    created_at: str


def _serialize(p: dict, current_user_id: Optional[str]) -> dict:
    out = {k: v for k, v in p.items() if k != "_id"}
    out["liked_by_me"] = current_user_id in (p.get("liked_by", []) or [])
    return out


def build_router(db, get_current_user_dep):
    router = APIRouter(prefix="/api/posts", tags=["posts"])

    @router.post("/create", response_model=PostPublic)
    async def create_post(
        content: str = Form(..., min_length=1, max_length=2000),
        media: Optional[UploadFile] = File(None),
        current: dict = Depends(get_current_user_dep),
    ):
        # Ban check
        if current.get("banned"):
            raise HTTPException(status_code=403, detail="Account is banned")

        media_url = None
        media_type = None

        if media is not None and media.filename:
            data = await media.read()
            if len(data) > MAX_FILE_BYTES:
                raise HTTPException(status_code=413, detail="File too large (max 20 MB)")
            if media.content_type not in ALLOWED_IMAGE_MIMES:
                raise HTTPException(status_code=415, detail=f"Unsupported file type: {media.content_type}")

            # 1) NSFW gate BEFORE uploading to Cloudinary
            check = await media_service.check_nudity(data, filename=media.filename)
            if not check["ok"]:
                # Auto-ban the user for attempting to upload NSFW
                await db.users.update_one(
                    {"user_id": current["user_id"]},
                    {"$set": {
                        "banned": True,
                        "ban_reason": check["reason"] or "NSFW content detected",
                        "banned_at": datetime.now(timezone.utc).isoformat(),
                    }},
                )
                logger.warning(
                    "User %s banned for NSFW upload: %s (score=%.3f)",
                    current["user_id"], check["reason"], check["score"],
                )
                raise HTTPException(
                    status_code=403,
                    detail="This image was flagged as adult content. OnlyBase has a strict no-NSFW policy — your account has been permanently banned.",
                )

            # 2) Upload to Cloudinary
            try:
                up = media_service.upload_image(data, folder="onlybase/posts", resource_type="image")
            except Exception as e:
                logger.exception("Cloudinary upload failed")
                raise HTTPException(status_code=502, detail="Media upload failed. Try again.")
            media_url = up["secure_url"]
            media_type = "image"

        # 3) Persist post doc
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "post_id": f"p_{uuid.uuid4().hex[:12]}",
            "author_id": current["user_id"],
            "author_name": current.get("name"),
            "author_handle": current.get("handle"),
            "author_avatar": current.get("avatar"),
            "author_verified": current.get("verified", False),
            "content": content,
            "media_url": media_url,
            "media_type": media_type,
            "likes": 0,
            "liked_by": [],
            "comments": 0,
            "tips": 0,
            "created_at": now,
        }
        await db.posts.insert_one(doc)
        return PostPublic(**_serialize(doc, current["user_id"]))

    @router.get("/feed", response_model=List[PostPublic])
    async def list_feed(
        limit: int = Query(50, ge=1, le=100),
        cursor: Optional[str] = Query(None),
        user: Optional[dict] = Depends(get_user_dep),
    ):
        q = {}
        if cursor:
            q["created_at"] = {"$lt": cursor}
        docs = await db.posts.find(q, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        uid = user["user_id"] if user else None
        return [PostPublic(**_serialize(d, uid)) for d in docs]

    @router.get("/user/{user_id}", response_model=List[PostPublic])
    async def list_by_user(
        user_id: str,
        user: Optional[dict] = Depends(get_user_dep),
    ):
        docs = await db.posts.find({"author_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
        uid = user["user_id"] if user else None
        return [PostPublic(**_serialize(d, uid)) for d in docs]

    @router.get("/{post_id}", response_model=PostPublic)
    async def get_post(post_id: str, user: Optional[dict] = Depends(get_user_dep)):
        p = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
        if not p:
            raise HTTPException(status_code=404, detail="Post not found")
        uid = user["user_id"] if user else None
        return PostPublic(**_serialize(p, uid))

    @router.post("/{post_id}/like", response_model=PostPublic)
    async def like_post(post_id: str, user: Optional[dict] = Depends(get_user_dep)):
        current = _require(user)
        p = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
        if not p:
            raise HTTPException(status_code=404, detail="Post not found")
        uid = current["user_id"]
        liked_by = p.get("liked_by", [])
        if uid in liked_by:
            liked_by.remove(uid)
        else:
            liked_by.append(uid)
        await db.posts.update_one(
            {"post_id": post_id},
            {"$set": {"liked_by": liked_by, "likes": len(liked_by)}},
        )
        p["liked_by"] = liked_by
        p["likes"] = len(liked_by)
        return PostPublic(**_serialize(p, uid))

    @router.delete("/{post_id}")
    async def delete_post(post_id: str, user: Optional[dict] = Depends(get_user_dep)):
        current = _require(user)
        p = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
        if not p:
            raise HTTPException(status_code=404, detail="Post not found")
        if p["author_id"] != current["user_id"] and current.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not allowed")
        # Remove media from Cloudinary (best-effort)
        if p.get("media_url"):
            # derive public_id from URL path: .../upload/v.../onlybase/posts/<id>.jpg
            try:
                parts = p["media_url"].split("/upload/")
                if len(parts) == 2:
                    tail = parts[1].split("/", 1)[1]  # strip version segment
                    public_id = tail.rsplit(".", 1)[0]
                    media_service.delete_image(public_id, resource_type=p.get("media_type") or "image")
            except Exception:
                logger.exception("Failed to derive Cloudinary public_id")
        await db.posts.delete_one({"post_id": post_id})
        return {"ok": True}

    return router
