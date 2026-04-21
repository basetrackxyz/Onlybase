"""Sightengine NSFW moderation + Cloudinary uploads."""
import os
import logging
from typing import Optional
import httpx
import cloudinary
import cloudinary.uploader

logger = logging.getLogger(__name__)

SIGHTENGINE_URL = "https://api.sightengine.com/1.0/check.json"
NUDITY_THRESHOLD = float(os.environ.get("SIGHTENGINE_NUDITY_THRESHOLD", "0.75"))


def _configure_cloudinary():
    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
        api_key=os.environ["CLOUDINARY_API_KEY"],
        api_secret=os.environ["CLOUDINARY_API_SECRET"],
        secure=True,
    )


async def check_nudity(image_bytes: bytes, filename: str = "upload.jpg") -> dict:
    """Call Sightengine's /check.json with the nudity model.

    Returns a dict with keys: ok (bool), score (float), reason (str), raw (full response).
    ok=False means the image was rejected (probability of sexual content > threshold).
    """
    try:
        files = {"media": (filename, image_bytes)}
        data = {
            "models": "nudity-2.1",
            "api_user": os.environ["SIGHTENGINE_USER"],
            "api_secret": os.environ["SIGHTENGINE_SECRET"],
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(SIGHTENGINE_URL, files=files, data=data)
        js = r.json()
    except Exception as e:
        logger.exception("Sightengine request failed")
        return {"ok": False, "score": 0, "reason": f"moderation service unavailable: {e}", "raw": {}}

    if js.get("status") != "success":
        return {
            "ok": False,
            "score": 0,
            "reason": js.get("error", {}).get("message", "Moderation check failed"),
            "raw": js,
        }

    nud = js.get("nudity", {})
    # nudity-2.1 returns granular probabilities. We use the top-level sexual_activity / sexual_display / erotica scores.
    score = max(
        nud.get("sexual_activity", 0) or 0,
        nud.get("sexual_display", 0) or 0,
        nud.get("erotica", 0) or 0,
        nud.get("very_suggestive", 0) or 0,
    )
    ok = score < NUDITY_THRESHOLD
    return {
        "ok": ok,
        "score": float(score),
        "reason": None if ok else f"Nudity probability {score:.2f} exceeds threshold {NUDITY_THRESHOLD:.2f}",
        "raw": js,
    }


def upload_image(image_bytes: bytes, folder: str = "onlybase/posts", resource_type: str = "image") -> dict:
    """Upload image bytes to Cloudinary. Returns {secure_url, public_id, width, height, format}."""
    _configure_cloudinary()
    result = cloudinary.uploader.upload(
        image_bytes,
        folder=folder,
        resource_type=resource_type,
        unique_filename=True,
        overwrite=False,
    )
    return {
        "secure_url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),
        "resource_type": result.get("resource_type"),
        "duration": result.get("duration"),
    }


def delete_image(public_id: str, resource_type: str = "image") -> None:
    _configure_cloudinary()
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception:
        logger.exception("Cloudinary delete failed for %s", public_id)
