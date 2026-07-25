import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { deleteCategory } from "@/src/queries/category";
import { deleteSubCategory } from "@/src/queries/subCategory";

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

function resolveInitialRole(email: string): "ADMIN" | "USER" {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return "USER";
  return adminEmails.includes(email.trim().toLowerCase()) ? "ADMIN" : "USER";
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  let event: { type: string; data: Record<string, unknown> };

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (error) {
    console.error("Invalid Clerk signature:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data as {
    id: string;
    email_addresses?: { email_address?: string }[];
    primary_email_address?: { email_address?: string };
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };

  try {
    if (eventType === "user.created") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? ` ${data.last_name}` : ""
      }`.trim();

      const role = resolveInitialRole(email);

      await db.user.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          name,
          email,
          image_url: data.image_url,
          role,
        },
      });
    }

    if (eventType === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? ` ${data.last_name}` : ""
      }`.trim();

      await db.user.update({
        where: { id: data.id },
        data: {
          name,
          email,
          image_url: data.image_url,
        },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Clerk webhook DB error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const subCategoryId = url.searchParams.get("subCategoryId");

    if (!categoryId && !subCategoryId) {
      return NextResponse.json(
        { success: false, message: "Missing categoryId or subCategoryId" },
        { status: 400 }
      );
    }

    if (subCategoryId) {
      await deleteSubCategory(subCategoryId);
      return NextResponse.json(
        { success: true, message: "Sub-category deleted" },
        { status: 200 }
      );
    }

    if (categoryId) {
      await deleteCategory(categoryId);
      return NextResponse.json(
        { success: true, message: "Category deleted" },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("DELETE /api/webhooks ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete record",
      },
      { status: 500 }
    );
  }
}
