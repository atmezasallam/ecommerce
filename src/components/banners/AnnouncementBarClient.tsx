"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AnnouncementMarquee from "@/src/components/banners/AnnouncementMarquee";

type AnnouncementBarClientProps = {
  messages: string[];
  speed: number;
  bgColor: string;
  textColor: string;
};

const COOKIE_KEY = "announcement_dismissed";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ?? null;
}

export default function AnnouncementBarClient({ messages, speed, bgColor, textColor }: AnnouncementBarClientProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const cookieValue = getCookie(COOKIE_KEY);
    if (cookieValue) {
      const dismissedUntil = Number(cookieValue);
      if (!Number.isNaN(dismissedUntil) && dismissedUntil > Date.now()) {
        setDismissed(true);
      }
    }
  }, []);

  if (dismissed) return null;

  const closeBar = () => {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    document.cookie = `${COOKIE_KEY}=${expiresAt};path=/;max-age=86400;samesite=lax`;
    setDismissed(true);
  };

  return (
    <div style={{ backgroundColor: bgColor }} className="relative z-10 w-full overflow-hidden py-2">
      <button
        type="button"
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white/80 hover:text-white"
        onClick={closeBar}
      >
        <X size={14} />
      </button>
      <AnnouncementMarquee messages={messages} speed={speed} textColor={textColor} />
    </div>
  );
}
