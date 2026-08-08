import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import {
  processClerkWebhook,
  type ClerkWebhookEvent,
} from "@/src/lib/clerk-webhook";

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

function resolveInitialRole(email: string): "ADMIN" | "USER" {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return "USER";
  return adminEmails.includes(email.trim().toLowerCase()) ? "ADMIN" : "USER";
}

/** Clerk webhook only: Svix verify + idempotent user.created / user.updated. */
export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const result = await processClerkWebhook({
    payload,
    svixId: headerPayload.get("svix-id"),
    svixTimestamp: headerPayload.get("svix-timestamp"),
    svixSignature: headerPayload.get("svix-signature"),
    deps: {
      verify: (body, hdrs) => {
        const wh = new Webhook(webhookSecret);
        return wh.verify(body, hdrs) as ClerkWebhookEvent;
      },
      hasProcessed: async (id) => {
        const existing = await db.webhookDelivery.findUnique({
          where: { id },
          select: { id: true },
        });
        return Boolean(existing);
      },
      markProcessed: async (id) => {
        await db.webhookDelivery.create({
          data: { id, source: "clerk" },
        });
      },
      resolveInitialRole,
      upsertUser: async (input) => {
        await db.user.upsert({
          where: { id: input.id },
          update: {},
          create: {
            id: input.id,
            name: input.name,
            email: input.email,
            image_url: input.image_url,
            role: input.role,
          },
        });
      },
      updateUser: async (input) => {
        await db.user.update({
          where: { id: input.id },
          data: {
            name: input.name,
            email: input.email,
            image_url: input.image_url,
          },
        });
      },
    },
  });

  if (result.status === 400) {
    if (result.body === "Invalid signature") {
      console.error("Invalid Clerk signature");
    }
    return new NextResponse(result.body, { status: 400 });
  }

  return new NextResponse(result.body, { status: 200 });
}
