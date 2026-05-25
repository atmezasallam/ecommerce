import { getActiveAnnouncementBar } from "@/src/app/actions/banner.actions";
import AnnouncementBarClient from "@/src/components/banners/AnnouncementBarClient";

export default async function AnnouncementBar() {
  const bar = await getActiveAnnouncementBar();
  if (!bar) return null;

  let messages: string[] = [];
  try {
    const parsed = JSON.parse(bar.messages) as unknown;
    if (Array.isArray(parsed)) {
      messages = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    messages = [];
  }

  if (messages.length === 0) return null;

  return (
    <AnnouncementBarClient messages={messages} speed={bar.speed} bgColor={bar.bgColor} textColor={bar.textColor} />
  );
}
