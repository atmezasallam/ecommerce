import { ProductType } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FC, ReactNode } from "react";
import ProductCard from "../cards/product/product-card";

interface Props {
  products: ProductType[];
  title?: string;
  link?: string;
  arrow?: boolean;
  horizontal?: boolean;
  showSeeAllTile?: boolean;
  titleClassName?: string;
}

interface TitleProps {
  title?: string;
  link?: string;
  arrow?: boolean;
  titleClassName?: string;
}

const Title: FC<TitleProps> = ({ title, link, arrow, titleClassName }) => {
  if (link) {
    return (
      <Link href={link} className="h-10 lg:h-12">
        <h2 className={cn("text-main-primary text-lg font-bold lg:text-xl", titleClassName)}>
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      </Link>
    );
  }
  return (
    <h2 className={cn("text-main-primary text-lg font-bold lg:text-xl", titleClassName)}>
      {title}&nbsp;
      {arrow && <ChevronRight className="w-3 inline-block" />}
    </h2>
  );
};

function SeeAllTile({ link }: { link: string }) {
  return (
    <Link
      href={link}
      className="group flex min-w-[170px] snap-start items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-dark via-slate-200 to-primary text-subtle shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg sm:min-w-[185px] md:min-w-[200px]"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-semibold tracking-tight">See all</span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-border/50 text-lg transition-all duration-300 group-hover:border-border group-hover:bg-base group-hover:text-white">
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ProductItems({ products, horizontal }: { products: ProductType[]; horizontal?: boolean }) {
  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className={cn({
            "min-w-[170px] snap-start sm:min-w-[185px] md:min-w-[200px]": horizontal,
          })}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </>
  );
}

const ProductList: FC<Props> = ({
  products,
  title,
  link,
  arrow,
  horizontal,
  showSeeAllTile,
  titleClassName,
}) => {
  let content: ReactNode;

  if (products.length === 0) {
    content = "No Products.";
  } else if (horizontal) {
    content = (
      <>
        {/* Mobile: 2-column grid */}
        <div className={cn("mt-2 grid grid-cols-2 gap-2 lg:hidden", { "mt-2": title })}>
          <ProductItems products={products} />
          {showSeeAllTile && link ? (
            <Link
              href={link}
              className="group col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-gradient-to-br from-dark via-slate-200 to-primary text-subtle shadow-sm"
            >
              <span className="text-sm font-semibold tracking-tight">See all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {/* Desktop: original horizontal scroll — unchanged */}
        <div
          className={cn(
            "scrollbar hidden gap-4 lg:flex lg:overflow-x-auto lg:pb-2 lg:pt-1 lg:snap-x lg:snap-mandatory lg:scroll-smooth lg:[mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]",
            { "lg:mt-2": title }
          )}
        >
          <ProductItems products={products} horizontal />
          {showSeeAllTile && link ? <SeeAllTile link={link} /> : null}
        </div>
      </>
    );
  } else {
    content = (
      <div
        className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6", {
          "mt-2": title,
        })}
      >
        <ProductItems products={products} />
      </div>
    );
  }

  return (
    <div className="relative">
      {title && <Title title={title} link={link} arrow={arrow} titleClassName={titleClassName} />}
      {content}
    </div>
  );
};

export default ProductList;
