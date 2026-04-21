import React from "react";
import { SealCheck } from "@phosphor-icons/react";

export default function VerifiedBadge({ size = 16, className = "" }) {
  return (
    <SealCheck
      weight="fill"
      size={size}
      className={`text-[#0052FF] inline-block shrink-0 ${className}`}
      data-testid="verified-badge"
    />
  );
}
