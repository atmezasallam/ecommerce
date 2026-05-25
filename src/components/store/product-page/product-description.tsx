"use client";
import DOMPurify from "dompurify";

function sanitizeHtml(value: string): string {
  const raw = String(value ?? "");

  // During server-side pre-render, DOMPurify may be a factory object without sanitize().
  if (typeof window === "undefined") {
    return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }

  const maybePurify = DOMPurify as unknown as { sanitize?: (input: string) => string };
  if (typeof maybePurify.sanitize === "function") {
    return maybePurify.sanitize(raw);
  }

  return raw;
}

export default function ProductDescription({
  text,
}: {
  text: [string, string];
}) {
  const sanitizedDescription1 = sanitizeHtml(text[0] ?? "");
  const sanitizedDescription2 = sanitizeHtml(text[1] ?? "");
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Description</h2>
      </div>
      {/* Display both descriptions */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription1 }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription2 }} />
    </div>
  );
}