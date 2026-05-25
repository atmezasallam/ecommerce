"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";

export async function getUserProfile() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");
  return db.user.findUnique({ where: { id: user.id } });
}

export async function updateUserProfile(data: { name?: string; image_url?: string }) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");
  return db.user.update({
    where: { id: user.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.image_url !== undefined ? { image_url: data.image_url } : {}),
    },
  });
}
