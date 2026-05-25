"use client";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import dynamic from "next/dynamic";
import type { Banner } from "@prisma/client";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import BannerSlide from "@/src/components/banners/BannerSlide";

const Swiper = dynamic(
  () => import("swiper/react").then((m) => m.Swiper),
  { ssr: false }
);
const SwiperSlide = dynamic(
  () => import("swiper/react").then((m) => m.SwiperSlide),
  { ssr: false }
);

type HeroBannerSliderProps = {
  banners: Banner[];
};

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  if (banners.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      loop
      className="home-hero-swiper w-full"
    >
      {banners.map((banner, index) => (
        <SwiperSlide key={banner.id}>
          <BannerSlide banner={banner} priority={index === 0} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
