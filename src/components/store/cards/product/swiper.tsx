"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { useRef, useState } from "react";

import type { ProductCardImage } from "@/src/lib/types";

import "swiper/css";

const Swiper = dynamic(
  () => import("swiper/react").then((m) => m.Swiper),
  { ssr: false }
);
const SwiperSlide = dynamic(
  () => import("swiper/react").then((m) => m.SwiperSlide),
  { ssr: false }
);

const imageFrameClass =
  "relative mb-1 h-[150px] w-full overflow-hidden rounded-xl bg-muted lg:mb-2 lg:h-[200px] lg:rounded-2xl";

const imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

function ProductImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={imageSizes}
      className={className ?? "object-cover"}
    />
  );
}

export default function ProductCardImageSwiper({
  images,
}: {
  images: ProductCardImage[];
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const validImages = images.filter((image) => image?.url);

  const startAutoplay = () => {
    if (validImages.length <= 1) return;
    setShowCarousel(true);
    swiperRef.current?.autoplay?.start?.();
  };

  const stopAndReset = () => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.autoplay?.stop?.();
    swiper.slideTo?.(0);
    setShowCarousel(false);
  };

  if (validImages.length === 0) {
    return (
      <div className={imageFrameClass}>
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      </div>
    );
  }

  return (
    <div
      className={imageFrameClass}
      onMouseEnter={startAutoplay}
      onMouseLeave={stopAndReset}
    >
      <ProductImage src={validImages[0].url} />

      {showCarousel && validImages.length > 1 ? (
        <div className="absolute inset-0 hidden lg:block">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 500 }}
            className="h-full w-full"
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {validImages.map((img, index) => (
              <SwiperSlide key={img.id || index} className="relative !h-full">
                <ProductImage src={img.url} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}
    </div>
  );
}
