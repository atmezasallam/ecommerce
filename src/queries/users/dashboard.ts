"use server";

import { db } from "@/src/lib/db";

export async function getUsersForAdmin() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getUserStats() {
  const totalUsers = await db.user.count();
  const sellers = await db.user.count({ where: { role: "SELLER" } });
  const admins = await db.user.count({ where: { role: "ADMIN" } });

  return { totalUsers, sellers, admins };
}
