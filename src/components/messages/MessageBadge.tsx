type MessageBadgeProps = {
  count: number;
};

export default function MessageBadge({ count }: MessageBadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
