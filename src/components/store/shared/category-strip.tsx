import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-main-primary text-2xl font-bold">
        Explore categories
      </h2>
      <div className="scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/browse?category=${category.url}`}
            className="group min-w-[110px] snap-start"
          >
            <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="overflow-hidden rounded-xl bg-base">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={120}
                  height={120}
                  className="h-[92px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <p className="mt-1 line-clamp-1 text-center text-sm font-medium text-main-primary">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
