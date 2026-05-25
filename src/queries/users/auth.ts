"use server";

import { db } from "@/src/lib/db";

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  id: string;
  email: string;
  name?: string;
  image_url?: string;
}) {
  return db.user.create({
    data: {
      id: data.id,
      email: data.email,
      name: data.name || "",
      image_url: data.image_url || "",
      role: "USER",
    },
  });
}
