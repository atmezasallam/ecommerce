import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(file) {
  try {
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {
    /* missing */
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const prisma = new PrismaClient();
const existing = await prisma.banner.findFirst({
  where: { type: "PROMOTIONAL", title: "zdvvddfdddd" },
});
if (existing) {
  console.log("Promotional banner already exists, skipping restore.");
} else {
  await prisma.banner.create({
    data: {
      title: "zdvvddfdddd",
      subtitle: "dddddddddddddddddddddd",
      image: "https://res.cloudinary.com/dwsbvexns/image/upload/v1776272654/y93rzpn4smnr9sbl5psm.png",
      type: "PROMOTIONAL",
      status: "ACTIVE",
      position: 0,
    },
  });
  console.log("Restored promotional banner for grid.");
}
await prisma.$disconnect();
