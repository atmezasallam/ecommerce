"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { ensureDbUserForClerk } from "@/src/lib/ensure-db-user";
import type { Message } from "@prisma/client";
import { StoreStatus } from "@prisma/client";
import type { ConversationBuyerView, ConversationSellerView } from "@/types/message.types";

const GENERAL_PRODUCT_KEY = "__general__";
const MAX_MESSAGE_LEN = 1000;
const LAST_PREVIEW_LEN = 100;
const RATE_MS = 2000;

function productKeyFor(productId: string | undefined): string {
  return productId ?? GENERAL_PRODUCT_KEY;
}

/** Clerk id + DB user id (may differ when the user row was matched by email). */
async function getParticipantContext(): Promise<{ clerkId: string; buyerId: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    const dbUser = await ensureDbUserForClerk();
    return { clerkId: userId, buyerId: dbUser.id };
  } catch {
    return null;
  }
}

async function assertConversationAccess(
  conversationId: string,
  participant: { clerkId: string; buyerId: string }
): Promise<{
  conversation: { id: string; buyerId: string; storeId: string; store: { userId: string } };
}> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId },
    include: { store: { select: { userId: true } } },
  });
  if (!conversation) {
    throw new Error("Conversation not found.");
  }
  const isBuyer = conversation.buyerId === participant.buyerId;
  const isSeller = conversation.store.userId === participant.clerkId;
  if (!isBuyer && !isSeller) {
    throw new Error("Unauthorized.");
  }
  return { conversation };
}

async function assertRateLimit(conversationId: string, senderId: string): Promise<void> {
  const last = await prisma.message.findFirst({
    where: { conversationId, senderId },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < RATE_MS) {
    throw new Error("Please wait a moment before sending another message.");
  }
}

function revalidateMessaging() {
  revalidatePath("/profile/messages");
  revalidatePath("/dashboard/seller/messages");
  revalidatePath("/");
}

export async function startConversation(
  storeId: string,
  initialMessage: string,
  productId?: string
): Promise<{ success: boolean; conversationId?: string; message?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "You must be signed in." };
  }

  const trimmed = initialMessage.trim();
  if (trimmed.length < 10) {
    return { success: false, message: "Message must be at least 10 characters." };
  }
  if (trimmed.length > MAX_MESSAGE_LEN) {
    return { success: false, message: `Message must be at most ${MAX_MESSAGE_LEN} characters.` };
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, userId: true, status: true },
  });
  // Product pages list items from stores that may still be PENDING; only block removed/banned stores.
  const cannotMessage =
    !store ||
    store.status === StoreStatus.BANNED ||
    store.status === StoreStatus.DISABLED;
  if (cannotMessage) {
    return {
      success: false,
      message: !store
        ? "Store not found."
        : "This store cannot receive messages right now.",
    };
  }
  if (store.userId === userId) {
    return { success: false, message: "You cannot message your own store." };
  }

  if (productId) {
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId, isArchived: false },
      select: { id: true },
    });
    if (!product) {
      return { success: false, message: "Product not found for this store." };
    }
  }

  const pKey = productKeyFor(productId);

  let buyerId: string;
  try {
    buyerId = (await ensureDbUserForClerk()).id;
  } catch {
    return { success: false, message: "You must be signed in." };
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      buyerId_storeId_productKey: {
        buyerId,
        storeId,
        productKey: pKey,
      },
    },
    create: {
      buyerId,
      storeId,
      productId: productId ?? null,
      productKey: pKey,
    },
    update: {},
  });

  await assertRateLimit(conversation.id, buyerId);

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        senderRole: "BUYER",
        content: trimmed,
        isRead: false,
      },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: trimmed.slice(0, LAST_PREVIEW_LEN),
        lastMessageAt: new Date(),
        sellerUnread: { increment: 1 },
        buyerUnread: 0,
      },
    }),
  ]);

  revalidateMessaging();
  return { success: true, conversationId: conversation.id };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; message?: string; data?: Message }> {
  const participant = await getParticipantContext();
  if (!participant) {
    return { success: false, message: "You must be signed in." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, message: "Message cannot be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LEN) {
    return { success: false, message: `Message must be at most ${MAX_MESSAGE_LEN} characters.` };
  }

  let conv: Awaited<ReturnType<typeof assertConversationAccess>>["conversation"];
  try {
    ({ conversation: conv } = await assertConversationAccess(conversationId, participant));
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Unauthorized." };
  }

  const isBuyer = conv.buyerId === participant.buyerId;
  const senderRole = isBuyer ? "BUYER" : "SELLER";
  const senderId = isBuyer ? participant.buyerId : participant.clerkId;

  try {
    await assertRateLimit(conversationId, senderId);
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Rate limited." };
  }

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      senderRole,
      content: trimmed,
      isRead: false,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: trimmed.slice(0, LAST_PREVIEW_LEN),
      lastMessageAt: new Date(),
      ...(isBuyer
        ? { sellerUnread: { increment: 1 }, buyerUnread: 0 }
        : { buyerUnread: { increment: 1 }, sellerUnread: 0 }),
    },
  });

  revalidateMessaging();
  return { success: true, data: msg };
}

const buyerInclude = {
  store: {
    select: {
      id: true,
      name: true,
      logo: true,
      url: true,
      defaultDeliveryTimeMin: true,
      defaultDeliveryTimeMax: true,
    },
  },
  product: { select: { id: true, name: true, slug: true } },
  messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

const sellerInclude = {
  buyer: { select: { id: true, name: true, image_url: true } },
  store: {
    select: {
      id: true,
      name: true,
      logo: true,
      url: true,
      defaultDeliveryTimeMin: true,
      defaultDeliveryTimeMax: true,
    },
  },
  product: { select: { id: true, name: true, slug: true } },
  messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

export async function getConversations(
  role: "BUYER" | "SELLER"
): Promise<ConversationBuyerView[] | ConversationSellerView[]> {
  const participant = await getParticipantContext();
  if (!participant) {
    return [];
  }

  if (role === "BUYER") {
    return prisma.conversation.findMany({
      where: { buyerId: participant.buyerId },
      include: buyerInclude,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    }) as Promise<ConversationBuyerView[]>;
  }

  const stores = await prisma.store.findMany({
    where: { userId: participant.clerkId },
    select: { id: true },
  });
  if (stores.length === 0) {
    return [];
  }
  return prisma.conversation.findMany({
    where: { storeId: { in: stores.map((s) => s.id) } },
    include: sellerInclude,
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  }) as Promise<ConversationSellerView[]>;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const participant = await getParticipantContext();
  if (!participant) {
    return [];
  }

  try {
    await assertConversationAccess(conversationId, participant);
  } catch {
    return [];
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { store: { select: { userId: true } } },
  });
  if (!conv) return [];

  const isBuyer = conv.buyerId === participant.buyerId;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  if (isBuyer) {
    await prisma.$transaction([
      prisma.message.updateMany({
        where: { conversationId, senderRole: "SELLER", isRead: false },
        data: { isRead: true },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { buyerUnread: 0 },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.message.updateMany({
        where: { conversationId, senderRole: "BUYER", isRead: false },
        data: { isRead: true },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { sellerUnread: 0 },
      }),
    ]);
  }

  revalidateMessaging();
  return messages;
}

/** Read-only thread fetch for polling (does not mutate read state). */
export async function listMessagesForPolling(conversationId: string): Promise<Message[]> {
  const participant = await getParticipantContext();
  if (!participant) return [];

  try {
    await assertConversationAccess(conversationId, participant);
  } catch {
    return [];
  }

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function markAsRead(conversationId: string): Promise<void> {
  await getMessages(conversationId);
}

export async function getTotalUnreadCount(): Promise<number> {
  const participant = await getParticipantContext();
  if (!participant) return 0;

  const [buyerSum, stores] = await Promise.all([
    prisma.conversation.aggregate({
      where: { buyerId: participant.buyerId },
      _sum: { buyerUnread: true },
    }),
    prisma.store.findMany({ where: { userId: participant.clerkId }, select: { id: true } }),
  ]);

  let sellerSum = 0;
  if (stores.length > 0) {
    const agg = await prisma.conversation.aggregate({
      where: { storeId: { in: stores.map((s) => s.id) } },
      _sum: { sellerUnread: true },
    });
    sellerSum = agg._sum.sellerUnread ?? 0;
  }

  return (buyerSum._sum.buyerUnread ?? 0) + sellerSum;
}

export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; message?: string }> {
  const participant = await getParticipantContext();
  if (!participant) {
    return { success: false, message: "You must be signed in." };
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { store: { select: { userId: true } } },
  });
  if (!conv) {
    return { success: false, message: "Conversation not found." };
  }
  const isBuyer = conv.buyerId === participant.buyerId;
  const isSeller = conv.store.userId === participant.clerkId;
  if (!isBuyer && !isSeller) {
    return { success: false, message: "Unauthorized." };
  }

  await prisma.conversation.delete({ where: { id: conversationId } });
  revalidateMessaging();
  return { success: true };
}

export async function getConversationByIdForParticipant(
  conversationId: string,
  role: "BUYER" | "SELLER"
): Promise<ConversationBuyerView | ConversationSellerView | null> {
  const participant = await getParticipantContext();
  if (!participant) return null;

  if (role === "BUYER") {
    const row = await prisma.conversation.findFirst({
      where: { id: conversationId, buyerId: participant.buyerId },
      include: buyerInclude,
    });
    return row as ConversationBuyerView | null;
  }

  const stores = await prisma.store.findMany({
    where: { userId: participant.clerkId },
    select: { id: true },
  });
  if (stores.length === 0) return null;
  const row = await prisma.conversation.findFirst({
    where: { id: conversationId, storeId: { in: stores.map((s) => s.id) } },
    include: sellerInclude,
  });
  return row as ConversationSellerView | null;
}
