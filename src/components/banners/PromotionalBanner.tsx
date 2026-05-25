import type { Banner } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type PromotionalBannerProps = {
  banner: Banner;
};

export default function PromotionalBanner({ banner }: PromotionalBannerProps) {
  return (
    <div
      className="relative mx-auto h-[120px] w-full max-w-7xl overflow-hidden rounded-2xl md:h-[160px]"
      style={{ backgroundColor: banner.bgColor }}
    >
      <Image src={banner.image} alt={banner.title?.trim() ? banner.title : "Promotional banner"} fill className="object-cover" />

      <div className="absolute inset-0 flex items-center justify-between px-8" style={{ color: banner.textColor }}>
        <div>
          {banner.subtitle ? <p className="text-sm opacity-75">{banner.subtitle}</p> : null}
          {banner.title?.trim() ? <h3 className="text-xl font-black md:text-2xl">{banner.title}</h3> : null}
        </div>

        {banner.ctaText ? (
          <Link
            href={banner.ctaLink || "/"}
            className="whitespace-nowrap rounded-full border-2 px-6 py-2 font-semibold transition-colors hover:bg-surface/10"
            style={{ borderColor: banner.textColor }}
          >
            {banner.ctaText}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
