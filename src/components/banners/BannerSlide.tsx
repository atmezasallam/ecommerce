"use client";

import { motion } from "framer-motion";
import type { Banner } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { incrementBannerClick } from "@/src/app/actions/banner.actions";

type BannerSlideProps = {
  banner: Banner;
  priority?: boolean;
};

export default function BannerSlide({ banner, priority = false }: BannerSlideProps) {
  const handleClick = () => {
    void incrementBannerClick(banner.id);
  };

  return (
    <div
      className="relative h-[280px] w-full overflow-hidden rounded-2xl md:h-[360px] lg:h-[460px]"
      style={{ backgroundColor: banner.bgColor }}
    >
      <Image
        src={banner.image}
        alt={banner.title?.trim() ? banner.title : "Banner"}
        fill
        className={cn("object-cover", banner.mobileImage ? "hidden sm:block" : "")}
        priority={priority}
        sizes="100vw"
      />
      {banner.mobileImage ? (
        <Image
          src={banner.mobileImage}
          alt={banner.title?.trim() ? banner.title : "Banner"}
          fill
          className="object-cover sm:hidden"
          priority={priority}
          sizes="100vw"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-900/30 to-indigo-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
      <div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-8">
          {/* No frosted full-width card: backdrop-blur read as a “hover slab” and can paint badly over images */}
          <div className="max-w-xl space-y-2 py-2 md:space-y-3 md:py-4" style={{ color: banner.textColor }}>
            {banner.subtitle ? (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="text-xs font-semibold uppercase tracking-[0.18em] opacity-95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] md:text-sm"
              >
                {banner.subtitle}
              </motion.p>
            ) : null}

            {banner.title?.trim() ? (
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="text-2xl font-black leading-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.85)] md:text-4xl lg:text-5xl"
              >
                {banner.title}
              </motion.h2>
            ) : null}

            {banner.description ? (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="line-clamp-2 text-sm opacity-95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)] md:text-base"
              >
                {banner.description}
              </motion.p>
            ) : null}

            {banner.ctaText && banner.ctaLink ? (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, delay: 0.2 }}>
                <Link
                  href={banner.ctaLink}
                  onClick={handleClick}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 md:px-6 md:py-3 md:text-base",
                    banner.ctaStyle === "outline" && "border-2 border-white text-white hover:bg-white hover:text-black",
                    banner.ctaStyle === "solid" && "bg-white text-black hover:bg-white/90",
                    banner.ctaStyle === "ghost" && "bg-transparent text-white hover:bg-white/10"
                  )}
                >
                  {banner.ctaText}
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
