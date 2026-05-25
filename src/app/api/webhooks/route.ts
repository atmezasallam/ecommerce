/*
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  let event: any;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data;

  try {
    if (eventType === "user.created") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

      const role = email === "salamtomy778@gmail.com" ? "ADMIN" : "USER";

      await clerkClient.users.updateUser(data.id, {
        privateMetadata: {
          role,
        },
      });

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
        data.last_name ? " " + data.last_name : ""
      }`;

      const existingUser = await db.user.findUnique({
        where: { id: data.id },
      });

      const role = (existingUser && existingUser.role) || "USER";

      await clerkClient.users.updateUser(data.id, {
        privateMetadata: {
          role,
        },
      });

      await db.user.update({
        where: { id: data.id },
        data: {
          name,
          email,
          image_url: data.image_url,
          role,
        },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}







*/
















/*  this is write one if the second faild


import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  let event: any;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data;

  try {
    if (eventType === "user.created") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

      await db.user.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          name,
          email,
          image_url: data.image_url,
          role: "USER",
        },
      });
    }

    if (eventType === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

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
    return new NextResponse("Error", { status: 500 });
  }
}





*/
/* the besssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssst
// src/app/api/webhooks/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { deleteCategory } from "@/src/queries/category";

// تأكدي إن المتغير موجود في env
const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

// =========================
// POST  →  Clerk Webhook
// =========================
export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  let event: any;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    console.error("Invalid Clerk signature:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data;

  try {
    if (eventType === "user.created") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

      await db.user.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          name,
          email,
          image_url: data.image_url,
          role: "USER",
        },
      });
    }

    if (eventType === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

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

// =========================
// DELETE  →  حذف Category
//        /api/webhooks?categoryId=xxx
// =========================
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Missing category ID" },
        { status: 400 }
      );
    }

    await deleteCategory(categoryId);

    return NextResponse.json(
      { success: true, message: "Category deleted" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/webhooks ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete category",
      },
      { status: 500 }
    );
  }
}

*/












// src/app/api/webhooks/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { deleteCategory } from "@/src/queries/category";
import { deleteSubCategory } from "@/src/queries/subCategory"; // ✅ جديد

// تأكدي إن المتغير موجود في env
const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

// =========================
// POST  →  Clerk Webhook
// =========================
export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  let event: any;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    console.error("Invalid Clerk signature:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = event.type;
  const data = event.data;

  try {
    if (eventType === "user.created") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

      await db.user.upsert({
        where: { id: data.id },
        update: {},
        create: {
          id: data.id,
          name,
          email,
          image_url: data.image_url,
          role: "USER",
        },
      });
    }

    if (eventType === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address?.email_address ??
        "";

      const name = `${data.first_name || ""}${
        data.last_name ? " " + data.last_name : ""
      }`;

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

// =========================
// DELETE  →  حذف Category / SubCategory
// - /api/webhooks?categoryId=xxx
// - /api/webhooks?subCategoryId=yyy
// =========================
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const subCategoryId = url.searchParams.get("subCategoryId");

    // لازم واحد منهم يكون موجود
    if (!categoryId && !subCategoryId) {
      return NextResponse.json(
        { success: false, message: "Missing categoryId or subCategoryId" },
        { status: 400 }
      );
    }

    // لو وصل subCategoryId → نحذف SubCategory
    if (subCategoryId) {
      await deleteSubCategory(subCategoryId);
      return NextResponse.json(
        { success: true, message: "Sub-category deleted" },
        { status: 200 }
      );
    }

    // غير هيك → نعتبره category
    if (categoryId) {
      await deleteCategory(categoryId);
      return NextResponse.json(
        { success: true, message: "Category deleted" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("DELETE /api/webhooks ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete record",
      },
      { status: 500 }
    );
  }
}


































/*import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma }   from "@/lib/db.";
import { clerkClient } from "@clerk/nextjs/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // نتحقق من الويب هوك ونجيب البيانات
    const evt = await verifyWebhook(req);
    const data = evt.data as any;      // بيانات اليوزر من Clerk
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      // نجهّز بيانات اليوزر اللي بدنا نخزنها
      const fullName =
        ((data.first_name ?? data.given_name ?? "") +
          " " +
          (data.last_name ?? data.family_name ?? "")).trim();

      const email =
        data.email_addresses?.[0]?.email_address ??
        data.email_address ??
        "";

      const imageUrl =
        data.image_url ?? data.profile_image_url ?? null;

      const userData = {
        id: data.id as string,
        email,
        name: fullName || null,
        imageUrl,
      };

      // نحفظ اليوزر في الداتابيس (create أو update لو موجود)
      await prisma.user.upsert({
        where: { id: userData.id },
        update: {
          email: userData.email,
          name: userData.name,
          imageUrl: userData.imageUrl,
        },
        create: userData,
      });

      console.log("User saved to DB:", userData);
    }


if (!user) return;



await clerkClient.users.updateUserMetadata(user.id, {
  picture: user.imageUrl,
  name: user.name,
});



    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}











*/




































/*import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { User } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
     const data = evt.data as any
    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
   if (evt.type === 'user.created' || evt.type === 'user.updated') {

const user: Partial<User> = {
  id: data.id,

};
  

  
}
 
}

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}*/

