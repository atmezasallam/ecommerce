import Link from "next/link";
import { MessageSquare } from "lucide-react";
import MessageBadge from "@/src/components/messages/MessageBadge";

type MessageHeaderLinkProps = {
  count: number;
};

export default function MessageHeaderLink({ count }: MessageHeaderLinkProps) {
  return (
    <div className="relative flex h-11 items-center px-2">
      <Link href="/profile/messages" className="flex items-center text-white/80 hover:text-white" aria-label="Messages">
        <span className="relative inline-flex">
          <MessageSquare className="h-7 w-7" strokeWidth={2} />
          <span className="absolute -right-1 -top-1">
            <MessageBadge count={count} />
          </span>
        </span>
        <b className="ml-1 hidden text-xs font-bold leading-4 sm:inline">Messages</b>
      </Link>
    </div>
  );
}
