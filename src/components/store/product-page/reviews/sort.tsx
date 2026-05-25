import { ReviewsOrderType } from "@/src/lib/types";
import { ChevronDown } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
  sort: ReviewsOrderType | undefined;
  setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>;
}

const ReviewsSort: FC<Props> = ({ sort, setSort }) => {
  return (
    <div className="group w-[120px]">
      {/* Trigger */}
      <button className="text-main-primary hover:text-[#fd384f] text-sm py-0.5 text-center inline-flex items-center">
        Sort by{" "}
        {sort?.orderBy === "latest"
          ? "latest"
          : sort?.orderBy === "highest"
          ? "highest"
          : "default"}
        <ChevronDown className="w-3 ml-1" />
      </button>
      <div className="z-10 hidden absolute bg-surface shadow w-[120px] group-hover:block">
        <ul className="text-m text-subtle">
          <li onClick={() => setSort(undefined)}>
            <span className="block p-2 text-sm cursor-pointer hover:bg-base">
              Sort by default
            </span>
          </li>
          <li onClick={() => setSort({ orderBy: "highest" })}>
            <span className="block p-2 text-sm cursor-pointer hover:bg-base">
              Sort by highest
            </span>
          </li>
          <li onClick={() => setSort({ orderBy: "latest" })}>
            <span className="block p-2 text-sm cursor-pointer hover:bg-base">
              Sort by latest
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewsSort;