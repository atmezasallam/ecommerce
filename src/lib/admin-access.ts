/**
 * Admin access must stay consistent across dashboard layout and pages.
 * Clerk privateMetadata sometimes differs from DB (or has stray whitespace).
 */
export function isPlatformAdmin(
  dbRole: string | null | undefined,
  clerkPrivateRole: unknown
): boolean {
  if (dbRole === "ADMIN") return true;
  if (typeof clerkPrivateRole !== "string") return false;
  return clerkPrivateRole.trim().toUpperCase() === "ADMIN";
}
