import type { Banner } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type PromotionalSixGridProps = {
  banners: Banner[];
};

export default function PromotionalSixGrid({ banners }: PromotionalSixGridProps) {
  const items = banners.slice(0, 6);
  const emptySlots = Math.max(0, 6 - items.length);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((banner) => (
          <Link
            key={banner.id}
            href={banner.ctaLink || "/"}
            className="group relative h-[170px] overflow-hidden rounded-2xl border border-border/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:h-[190px] lg:h-[170px] xl:h-[190px]"
            style={{ backgroundColor: banner.bgColor }}
          >
            <Image
              src={banner.image}
              alt={banner.title?.trim() ? banner.title : "Promotional banner"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/15" />
            <div className="absolute inset-0 p-4">
              <div className="flex h-full flex-col justify-between">
                <div className="max-w-[75%]">
                  <p className="line-clamp-1 text-xs font-medium text-white/90">
                    {banner.subtitle || "Special offer"}
                  </p>
                  {banner.title?.trim() ? (
                    <h3 className="line-clamp-2 text-base font-bold leading-tight text-white drop-shadow-sm">
                      {banner.title}
                    </h3>
                  ) : null}
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-white/70 bg-surface/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-surface group-hover:text-subtle">
                  Shop now
                </span>
              </div>
            </div>
          </Link>
        ))}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`promo-empty-${index}`}
            className="relative h-[170px] overflow-hidden rounded-2xl border border-dashed border-border bg-gradient-to-br from-dark to-primary sm:h-[190px] lg:h-[170px] xl:h-[190px]"
          >
            <div className="grid h-full place-items-center px-4 text-center">
              <div>
                <p className="text-sm font-semibold text-subtle">Empty promo slot</p>
                <p className="text-xs text-subtle">Add more cards from admin dashboard</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
