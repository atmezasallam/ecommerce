"use client";
import ColorWheel from "@/src/components/shared/color-wheel";
import { ReviewWithImageType } from "@/src/lib/types";
import { censorName } from "@/src/lib/utils";
import Image from "next/image";
import StarRating from "@/src/components/store/shared/star-rating";

export default function ReviewCard({
  review,
}: {
  review: ReviewWithImageType;
}) {
  const { images, user } = review;
  const colors = review.color
    .split(",")
    .filter((color) => color.trim() !== "") // Remove any empty strings
    .map((color) => ({ name: color.trim() }));

  const { name } = user;
  const safeName = name?.trim() || "?";
  const cesnoredName = `${safeName[0]}***${safeName[safeName.length - 1] ?? ""}`;
  return (
    <div className="border border-border rounded-xl flex h-fit relative py-4 px-2.5">
      <div className="w-16 px- space-y-1">
        {user.image_url ? (
          <Image
            src={user.image_url}
            alt="Profile image"
            width={100}
            height={100}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full bg-muted"
            aria-hidden
          />
        )}
        <span className="text-xs text-main-secondary">
          {cesnoredName.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between leading-5 overflow-hidden px-1.5">
        <div className="space-y-2">
          <StarRating
            count={5}
            size={24}
            color1="#E8EAFB"
            color2="#95CFB2"
            value={Number(review.rating) || 0}
            half
          />
          <div className="flex items-center gap-x-2">
            <ColorWheel colors={colors} size={24} />
            <div className="text-main-secondary text-sm">{review.variant}</div>
            <span>.</span>
            <div className="text-main-secondary text-sm">{review.size}</div>
            <span>.</span>
            <div className="text-main-secondary text-sm">
              {review.quantity} PC
            </div>
          </div>
          <p className="text-sm">{review.review}</p>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}