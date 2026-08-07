import { cn } from "@/src/lib/utils";
import { Category } from "@prisma/client";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

export default function CategoriesMenu({
  categories,
  open,
  setOpen,
}: {
  categories: Category[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const toggleMenu = useCallback((state: boolean) => {
    setOpen(state);
    if (state) {
      setTimeout(() => {
        setDropdownVisible(true);
      }, 100);
    } else {
      setDropdownVisible(false);
    }
  }, [setOpen]);

  const handleClick = () => {
    if (!hoverCapable) {
      toggleMenu(!open);
    }
  };

  return (
    <div
      className="relative z-50 h-10 w-10 shrink-0 xl:w-[256px]"
      onMouseEnter={() => hoverCapable && toggleMenu(true)}
      onMouseLeave={() => hoverCapable && toggleMenu(false)}
    >
      {/* Trigger and Dropdown Container */}
      <div className="relative">
        {/* Trigger */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          className={cn(
            "group relative flex h-11 w-12 cursor-pointer items-center rounded-full text-white transition-all duration-300 ease-out xl:w-[256px] xl:translate-y-0",
            "border border-black/20 bg-[#7dbfa4] backdrop-blur-sm hover:border-black/40 hover:bg-[#7dbfa4] hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98]",
            {
              "w-[min(256px,calc(100vw-2rem))] rounded-b-none rounded-t-[20px] border-black/40 bg-[#7dbfa4] text-white text-base scale-100 hover:bg-[#7dbfa4] hover:shadow-2xl":
                open,
              "scale-75": !open,
            }
          )}
        >
          {/* Menu Icon with transition to move right when open */}
          <Menu
            className={cn("absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out xl:ml-1", {
              "left-5": open,
              "left-3": !open,
              "group-hover:scale-110": !open,
            })}
          />

          <span
            className={cn("hidden xl:ml-11 xl:inline-flex font-medium transition-all duration-300 ease-out", {
              "inline-flex !ml-14": open,
              "group-hover:translate-x-0.5 group-hover:text-white": !open,
            })}
          >
            All Categories
          </span>

          <ChevronDown
            className={cn("absolute right-3 hidden scale-75 transition-all duration-300 ease-out xl:inline-flex", {
              "inline-flex rotate-180": open,
              "group-hover:translate-y-0.5 group-hover:scale-90": !open,
            })}
          />
        </div>
        {/* Dropdown */}
        <ul
          className={cn(
            "scrollbar absolute left-0 top-10 z-50 w-[min(256px,calc(100vw-2rem))] overflow-y-auto rounded-b-[20px] border border-black/20 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur-sm transition-all duration-300 ease-out origin-top",
            {
              "pointer-events-auto max-h-[523px] scale-100 opacity-100 translate-y-0": dropdownVisible, // Show dropdown
              "pointer-events-none max-h-0 scale-[0.98] opacity-0 -translate-y-1": !dropdownVisible, // Hide dropdown
            }
          )}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/browse?category=${category.url}`}
              className="text-primary"
            >
              <li className="group/item relative m-0 flex items-center gap-2 border-l-4 border-transparent p-3 pl-6 text-gray-800 transition-all duration-200 ease-out hover:border-[#7dbfa4] hover:bg-[#7dbfa4]/10 hover:pl-7 hover:shadow-sm">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="h-[18px] w-[18px] rounded-sm object-cover transition-transform duration-200 ease-out group-hover/item:scale-110"
                />
                <span className="line-clamp-2 overflow-hidden break-words text-sm font-normal text-gray-800 transition-colors duration-200 ease-out group-hover/item:text-black group-hover/item:font-medium">
                  {category.name}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}