//React, Nextjs
import dynamic from "next/dynamic";
import Image from "next/image";

import { Autoplay } from "swiper/modules";
const Swiper = dynamic(
  () => import("swiper/react").then((m) => m.Swiper),
  { ssr: false }
);
const SwiperSlide = dynamic(
  () => import("swiper/react").then((m) => m.SwiperSlide),
  { ssr: false }
);

// Import Swiper styles
import "swiper/css";
//import "swiper/css/pagination";
//import "swiper/css/navigation";

// Types
import { ProductVariantImage } from "@prisma/client";
import { useEffect, useRef } from "react";

export default function ProductCardImageSwiper({
  images,
}: {
  images: ProductVariantImage[];
}) {
  const swiperRef = useRef<any>(null);

  const startAutoplay = () => {
    swiperRef.current?.swiper?.autoplay?.start?.();
  };

  const stopAndReset = () => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;
    swiper.autoplay?.stop?.();
    swiper.slideTo?.(0);
  };

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.stop();
    }
  }, [swiperRef]);
  return (
    <div
      className="relative mb-2 w-full h-[200px] bg-surface contrast-[90%] rounded-2xl overflow-hidden"
      onMouseEnter={startAutoplay}
      onMouseLeave={stopAndReset}
    >
      <Swiper ref={swiperRef} modules={[Autoplay]} autoplay={{ delay: 500 }}>
        {images.map((img, index) => (
          <SwiperSlide key={img.id || index}>
            <Image
              src={img.url}
              alt=""
              width={400}
              height={400}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="block object-cover h-[200px] w-48 sm:w-52"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}