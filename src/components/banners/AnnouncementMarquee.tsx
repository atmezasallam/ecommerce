"use client";

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

type AnnouncementMarqueeProps = {
  messages: string[];
  speed: number;
  textColor: string;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export default function AnnouncementMarquee({ messages, speed, textColor }: AnnouncementMarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const label = messages.join("  ·  ");
  const scrollDuration = Math.max(speed, 12);

  useEffect(() => {
    if (prefersReducedMotion || messages.length <= 1) return;

    const displayMs = Math.min(Math.max(speed * 500, 3500), 8000);
    let fadeTimer: number | undefined;

    const timer = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 200);
    }, displayMs);

    return () => {
      window.clearInterval(timer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [messages.length, prefersReducedMotion, speed]);

  if (messages.length === 0) return null;

  if (prefersReducedMotion || messages.length === 1) {
    const text = messages.length === 1 ? messages[0] : messages[index];

    return (
      <div className="flex min-h-5 items-center justify-center px-10">
        <p
          className={cn(
            "max-w-3xl text-center text-xs leading-relaxed sm:text-sm",
            "line-clamp-2 sm:line-clamp-1",
            messages.length > 1 && "transition-opacity duration-200",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ color: textColor }}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max animate-marquee"
        style={{ color: textColor, ["--marquee-speed" as string]: `${scrollDuration}s` }}
      >
        <p className="shrink-0 whitespace-nowrap px-8 text-xs font-normal leading-relaxed sm:text-sm">
          {label}
        </p>
        <p aria-hidden className="shrink-0 whitespace-nowrap px-8 text-xs font-normal leading-relaxed sm:text-sm">
          {label}
        </p>
      </div>
    </div>
  );
}
