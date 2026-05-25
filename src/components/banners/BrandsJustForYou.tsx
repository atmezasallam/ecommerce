"use client";

import type { HomepageBrand } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

type BrandsJustForYouProps = {
  brands: HomepageBrand[];
};

export default function BrandsJustForYou({ brands }: BrandsJustForYouProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-brand-card]");
    const delta = card ? card.offsetWidth + 16 : 280;
    el.scrollBy({ left: direction * delta * 2, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || brands.length <= 1) return;

    const timer = window.setInterval(() => {
      const card = el.querySelector<HTMLElement>("[data-brand-card]");
      const delta = card ? card.offsetWidth + 16 : 280;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const nextScrollLeft = el.scrollLeft + delta;

      if (nextScrollLeft >= maxScrollLeft - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      el.scrollBy({ left: delta, behavior: "smooth" });
    }, 2600);

    return () => window.clearInterval(timer);
  }, [brands.length]);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-subtle md:text-xl">Brands just for you</h2>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] md:gap-5 md:pr-12 [&::-webkit-scrollbar]:hidden"
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              data-brand-card
              href={brand.href || "/browse"}
              className="group relative size-[104px] shrink-0 overflow-hidden rounded-full border border-border/90 bg-surface shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:size-[132px]"
            >
              <div className="flex size-full items-center justify-center p-3 md:p-4">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={112}
                  height={112}
                  unoptimized
                  className="max-h-[76px] max-w-[76px] object-contain transition-transform duration-300 group-hover:scale-[1.06] md:max-h-[96px] md:max-w-[96px]"
                />
              </div>
            </Link>
          ))}
        </div>
        {brands.length > 1 ? (
          <button
            type="button"
            aria-label="Scroll brands right"
            onClick={() => scrollByCards(1)}
            className="absolute right-0 top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 text-subtle shadow-sm backdrop-blur-sm transition hover:bg-base md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
