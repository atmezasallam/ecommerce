"use client";

type AnnouncementMarqueeProps = {
  messages: string[];
  speed: number;
  textColor: string;
};

export default function AnnouncementMarquee({ messages, speed, textColor }: AnnouncementMarqueeProps) {
  if (messages.length === 0) return null;

  return (
    <div className="flex whitespace-nowrap">
      <div className="animate-marquee flex min-w-full gap-16 pr-16" style={{ color: textColor, ["--marquee-speed" as string]: `${speed}s` }}>
        {messages.map((message, index) => (
          <span key={`${message}-${index}`} className="text-sm font-medium">
            {message} ✦
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="animate-marquee flex min-w-full gap-16 pr-16"
        style={{ color: textColor, ["--marquee-speed" as string]: `${speed}s` }}
      >
        {messages.map((message, index) => (
          <span key={`copy-${message}-${index}`} className="text-sm font-medium">
            {message} ✦
          </span>
        ))}
      </div>
    </div>
  );
}
