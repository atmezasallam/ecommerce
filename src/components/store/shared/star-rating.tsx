"use client";

import { cn } from "@/src/lib/utils";
import { FC } from "react";

export type StarRatingProps = {
  value: number;
  count?: number;
  size?: number;
  color1?: string;
  color2?: string;
  half?: boolean;
  edit?: boolean;
  onChange?: (v: number) => void;
  className?: string;
};

/**
 * Read-only / editable star row — no `react-stars` (avoids Next.js RSC/SSR crashes).
 */
const StarRating: FC<StarRatingProps> = ({
  value,
  count = 5,
  size = 24,
  color1 = "#E8EAFB",
  color2 = "#95CFB2",
  half = true,
  edit = false,
  onChange,
  className,
}) => {
  const v = Math.min(count, Math.max(0, Number(value) || 0));

  if (edit && onChange) {
    const rounded = Math.round(v);
    return (
      <div
        className={cn("inline-flex items-center gap-0.5", className)}
        role="group"
        aria-label="Rating"
      >
        {Array.from({ length: count }, (_, i) => {
          const n = i + 1;
          const active = n <= rounded;
          return (
            <button
              key={n}
              type="button"
              className="rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of ${count}`}
            >
              <span
                aria-hidden
                className="leading-none"
                style={{ fontSize: size, color: active ? color2 : color1 }}
              >
                ★
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${v} out of ${count} stars`}
    >
      {Array.from({ length: count }, (_, i) => {
        const starPos = i + 1;
        const isFull = v >= starPos;
        const isHalf =
          half && !isFull && v >= starPos - 0.5 && v < starPos;

        return (
          <span
            key={i}
            className="relative inline-flex flex-shrink-0 items-center justify-center"
            style={{ fontSize: size, lineHeight: 1 }}
          >
            {isFull && (
              <span className="leading-none" style={{ color: color2 }}>
                ★
              </span>
            )}
            {isHalf && (
              <span className="relative inline-block leading-none">
                <span style={{ color: color1 }}>★</span>
                <span
                  className="absolute left-0 top-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <span style={{ color: color2 }}>★</span>
                </span>
              </span>
            )}
            {!isFull && !isHalf && (
              <span className="leading-none" style={{ color: color1 }}>
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default StarRating;
