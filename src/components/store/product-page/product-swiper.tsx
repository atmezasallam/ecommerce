"use client";

import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { ProductVariantImage } from "@prisma/client";

/**
 * Main image + thumbnails. Avoids `react-image-zooom` (styled-components + zoom)
 * which can trigger "Objects are not valid as a React child" under Next.js RSC/SSR.
 */
export default function ProductSwiper({
  images,
  activeImage,
  setActiveImage,
}: {
  images: ProductVariantImage[];
  activeImage: ProductVariantImage | null;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}) {
  if (!images?.length) return null;

  return (
    <div className="relative">
      <div className="relative flex w-full flex-col-reverse gap-2 xl:flex-row">
        <div className="flex flex-wrap gap-3 xl:flex-col">
          {images.map((img) => (
            <div
              key={img.url}
              className={cn(
                "grid h-16 w-16 cursor-pointer place-items-center overflow-hidden rounded-md border border-border transition-all duration-75 ease-in",
                {
                  "border-main-primary": activeImage
                    ? activeImage.id === img.id
                    : false,
                }
              )}
              onMouseEnter={() => setActiveImage(img)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            </div>
          ))}
        </div>
        <div className="relative w-full overflow-hidden rounded-lg 2xl:h-[600px] 2xl:w-[600px]">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt}
              width={1200}
              height={1200}
              className="h-auto w-full max-h-[600px] rounded-lg object-contain 2xl:h-[600px] 2xl:w-[600px] 2xl:object-cover"
              sizes="(max-width: 1280px) 100vw, 600px"
              priority
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
