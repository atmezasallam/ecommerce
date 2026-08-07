import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";

import prisma from "@/lib/prisma";

/** Find or create the Prisma user for the signed-in Clerk account (no Clerk field overwrite). */
export async function findOrCreateDbUserForClerk(): Promise<User> {
  const authUser = await currentUser();
  if (!authUser) throw new Error("Unauthenticated");

  const clerkEmail =
    authUser.emailAddresses?.[0]?.emailAddress ??
    authUser.primaryEmailAddress?.emailAddress ??
    "";

  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser && clerkEmail) {
    dbUser = await prisma.user.findUnique({
      where: { email: clerkEmail },
    });
  }

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        name:
          authUser.firstName || authUser.lastName
            ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
            : authUser.username || authUser.id,
        email: clerkEmail,
        image_url: authUser.imageUrl,
        role: "USER",
      },
    });
  }

  return dbUser;
}

/** Ensure a DB user exists for the signed-in Clerk account. Does not overwrite Salamo profile fields. */
export async function ensureDbUserForClerk(): Promise<User> {
  return findOrCreateDbUserForClerk();
}
