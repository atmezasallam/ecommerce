import { Skeleton } from "@/src/components/ui/skeleton";

export default function UserAccountLoading() {
  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
