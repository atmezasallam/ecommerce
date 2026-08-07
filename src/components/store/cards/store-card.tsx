"use client";
import { cn } from "@/src/lib/utils";
import { followStore } from "@/src/queries/user";
import { useUser } from "@clerk/nextjs";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";

import MessageSellerButton from "@/src/components/messages/MessageSellerButton";

interface Props {
  store: {
    id: string;
    url: string;
    name: string;
    logo: string;
    followersCount: number;
    isUserFollowingStore: boolean;
  };
  productId?: string;
  productName?: string;
  productImageUrl?: string;
}

const StoreCard: FC<Props> = ({ store, productId, productName, productImageUrl }) => {
  const { id, name, logo, url, followersCount, isUserFollowingStore } = store;
  const [following, setFollowing] = useState<boolean>(isUserFollowingStore);
  const [storeFollowersCount, setStoreFollowersCount] =
    useState<number>(followersCount);
  // Clerk: use the hook result fields directly — do not confuse with `user` (the signed-in profile).
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Only strings/numbers should reach the DOM — never pass through unknown objects as React text children.
  const displayName = String(name ?? "");
  const storeUrl = String(url ?? "");
  const logoSrc = String(logo ?? "");

  const handleStoreFollow = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    try {
      const res = await followStore(id);
      setFollowing(res);
      if (res) {
        setStoreFollowersCount((prev) => prev + 1);
        // toast.success(`You are now following ${name}`);
      }
      if (!res) {
        setStoreFollowersCount((prev) => prev - 1);
        // toast.success(`You unfollowed ${name}`);
      }
    } catch (error) {
      toast.error("Something happend, Try again later !");
    }
  };
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 rounded-xl bg-muted/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center">
          <Link href={`/store/${storeUrl}`}>
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={displayName}
                width={50}
                height={50}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-sm font-bold text-main-primary">
                {displayName.slice(0, 1).toUpperCase() || "S"}
              </div>
            )}
          </Link>
          <div className="mx-2 min-w-0">
            <div className="truncate text-xl font-bold leading-6">
              <Link href={`/store/${storeUrl}`} className="text-main-primary hover:underline">
                {displayName}
              </Link>
            </div>
            <div className="mt-1 text-sm leading-5">
              <strong>100%</strong>
              <span> Positive Feedback</span>&nbsp;|&nbsp;
              <strong>{storeFollowersCount}</strong>
              <strong> Followers</strong>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:shrink-0">
          <div
            className={cn(
              "flex h-9 cursor-pointer items-center rounded-full border border-main-primary px-4 text-base font-bold transition-colors",
              following
                ? "bg-main-primary text-white"
                : "bg-white text-main-primary hover:bg-main-primary hover:text-white"
            )}
            onClick={() => handleStoreFollow()}
          >
            {following ? (
              <Check className="w-4 me-1" />
            ) : (
              <Plus className="w-4 me-1" />
            )}
            <span>{following ? "Following" : "Follow"}</span>
          </div>
          <div>
            <MessageSellerButton
              storeId={id}
              storeName={displayName}
              storeLogo={logoSrc}
              productId={productId}
              productName={productName}
              productImageUrl={productImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;