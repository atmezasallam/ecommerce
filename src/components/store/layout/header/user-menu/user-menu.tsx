import { currentUser } from "@clerk/nextjs/server";
import { ChevronDown, UserIcon } from "lucide-react";
import Image from "next/image";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import { findOrCreateDbUserForClerk } from "@/src/lib/ensure-db-user";
import UserMenuDropdown from "./user-menu-dropdown";

export default async function UserMenu() {
  const user = await currentUser();
  const messageUnread = user ? await getTotalUnreadCount() : 0;
  let avatarUrl = user?.imageUrl ?? "";
  let displayName = user?.fullName ?? "Member";

  if (user) {
    try {
      const dbUser = await findOrCreateDbUserForClerk();
      avatarUrl = dbUser.image_url ?? user.imageUrl;
      displayName = dbUser.name || displayName;
    } catch {
      // Fall back to Clerk profile fields.
    }
  }

  return (
    <div className="relative group">
      <div>
        {user ? (
          avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )
        ) : (
          <div className="mx-2 flex h-11 cursor-pointer items-center py-0">
            <span className="text-2xl">
              <UserIcon />
            </span>
            <div className="ml-1">
              <span className="block text-xs leading-3 text-white">Welcome</span>
              <b className="text-xs font-bold leading-4 text-white">
                <span>Sign in / Register</span>
                <span className="inline-block scale-[60%] align-middle text-white">
                  <ChevronDown />
                </span>
              </b>
            </div>
          </div>
        )}
      </div>
      <UserMenuDropdown isSignedIn={!!user} messageUnread={messageUnread} />
    </div>
  );
}
