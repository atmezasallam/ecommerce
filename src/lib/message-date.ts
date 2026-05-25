import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  differenceInMinutes,
} from "date-fns";

export function formatListTime(date: Date): string {
  const d = new Date(date);
  const mins = differenceInMinutes(new Date(), d);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatMessageTime(date: Date): string {
  const d = new Date(date);
  const mins = differenceInMinutes(new Date(), d);
  if (mins < 1) return "Just now";
  if (isToday(d)) {
    return format(d, "h:mm a");
  }
  if (isYesterday(d)) {
    return `Yesterday ${format(d, "h:mm a")}`;
  }
  return format(d, "MMM d, h:mm a");
}

export function formatDayDivider(date: Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}
