import type { Conversation, Message, Product, Store, User } from "@prisma/client";

export type ConversationBuyerView = Conversation & {
  store: Pick<
    Store,
    "id" | "name" | "logo" | "url" | "defaultDeliveryTimeMin" | "defaultDeliveryTimeMax"
  >;
  product: Pick<Product, "id" | "name" | "slug"> | null;
  messages: Message[];
};

export type ConversationSellerView = Conversation & {
  buyer: Pick<User, "id" | "name" | "image_url">;
  store: Pick<
    Store,
    "id" | "name" | "logo" | "url" | "defaultDeliveryTimeMin" | "defaultDeliveryTimeMax"
  >;
  product: Pick<Product, "id" | "name" | "slug"> | null;
  messages: Message[];
};

export type ConversationFull = ConversationBuyerView | ConversationSellerView;
