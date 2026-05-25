import { ProductType } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
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
      <Link href={link} className="h-12">
        <h2 className={cn("text-main-primary text-xl font-bold", titleClassName)}>
          {title}&nbsp;
          {arrow && <ChevronRight className="w-3 inline-block" />}
        </h2>
      </Link>
    );
  }
  return (
    <h2 className={cn("text-main-primary text-xl font-bold", titleClassName)}>
      {title}&nbsp;
      {arrow && <ChevronRight className="w-3 inline-block" />}
    </h2>
  );
};

const ProductList: FC<Props> = ({
  products,
  title,
  link,
  arrow,
  horizontal,
  showSeeAllTile,
  titleClassName,
}) => {
  return (
    <div className="relative">
      {title && <Title title={title} link={link} arrow={arrow} titleClassName={titleClassName} />}
      {products.length > 0 ? (
        <div
          className={cn(
            "gap-4",
            {
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6": !horizontal,
              "scrollbar flex overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]":
                horizontal,
              "mt-2": title,
            }
          )}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={cn({
                "min-w-[170px] sm:min-w-[185px] md:min-w-[200px] snap-start": horizontal,
              })}
            >
              <ProductCard product={product} />
            </div>
          ))}
          {horizontal && showSeeAllTile && link && (
            <Link
              href={link}
              className="group min-w-[170px] sm:min-w-[185px] md:min-w-[200px] snap-start rounded-2xl border border-border/70 bg-gradient-to-br from-dark via-slate-200 to-primary text-subtle flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-xl font-semibold tracking-tight">See all</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-border/50 text-lg transition-all duration-300 group-hover:bg-base group-hover:text-white group-hover:border-border">
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      ) : (
        "No Products."
      )}
    </div>
  );
};

export default ProductList;
