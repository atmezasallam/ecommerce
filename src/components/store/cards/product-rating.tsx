"use client";
import StarRating from "@/src/components/store/shared/star-rating";

export default function RatingCard({ rating }: { rating: number }) {
  const fixed_rating = Number(rating.toFixed(2));
  return (
    <div className="h-44 flex-1">
      <div className="p-6 bg-primary-light flex flex-col h-full justify-center overflow-hidden rounded-lg">
        <div className="text-6xl font-bold">{rating}</div>
        <div className="py-1.5">
          <StarRating
            count={5}
            value={Number(fixed_rating) || 0}
            size={24}
            color1="#e2dfdf"
            color2="#95CFB2"
            half
          />
        </div>
        <div className="text-accent leading-5 mt-2">
          All from verified purchases
        </div>
      </div>
    </div>
  );
}