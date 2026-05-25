"use client";
import { StatisticsCardType } from "@/src/lib/types";
import StarRating from "@/src/components/store/shared/star-rating";

export default function RatingStatisticsCard({
  statistics,
}: {
  statistics: StatisticsCardType;
}) {
  return (
    <div className="h-44 flex-1">
      <div className="py-5 px-7 bg-primary-light flex flex-col gap-y-2 h-full justify-center overflow-hidden rounded-lg">
        {statistics
          .slice()
          .reverse()
          .map((rating) => (
            <div key={rating.rating} className="flex items-center h-4">
              <StarRating
                count={5}
                value={Number(rating.rating) || 0}
                size={15}
                color1="#e2dfdf"
                color2="#95CFB2"
                half={false}
              />
              <div className="relative w-full flex-1 h-1.5 mx-2.5 bg-border rounded-full">
                <div
                  className="absolute left-0 h-full rounded-full bg-accent"
                  style={{ width: `${rating.percentage}%` }}
                />
              </div>
              <div className="text-xs w-12 leading-4">{rating.numReviews}</div>
            </div>
          ))}
      </div>
    </div>
  );
}