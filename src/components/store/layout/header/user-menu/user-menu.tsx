import { currentUser } from "@clerk/nextjs/server";
import { ChevronDown, UserIcon } from "lucide-react";
import Image from "next/image";
import { getTotalUnreadCount } from "@/src/app/actions/message.actions";
import UserMenuDropdown from "./user-menu-dropdown";

export default async function UserMenu() {
  const user = await currentUser();
  const messageUnread = user ? await getTotalUnreadCount() : 0;
  return (
    <div className="relative group">
      <div>
        {user ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName!}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded-full"
          />
        ) : (
          <div className="flex h-11 items-center py-0 mx-2 cursor-pointer">
            <span className="text-2xl">
              <UserIcon />
            </span>
            <div className="ml-1">
              <span className="block text-xs text-white leading-3">
                Welcome
              </span>
              <b className="font-bold text-xs text-white leading-4">
                <span>Sign in / Register</span>
                <span className="text-white scale-[60%] align-middle inline-block">
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
