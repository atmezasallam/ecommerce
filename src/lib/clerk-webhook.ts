export type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address?: string }[];
    primary_email_address?: { email_address?: string };
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
};

export type ClerkWebhookDeps = {
  verify: (
    payload: string,
    headers: { "svix-id": string; "svix-timestamp": string; "svix-signature": string }
  ) => ClerkWebhookEvent;
  hasProcessed: (svixId: string) => Promise<boolean>;
  markProcessed: (svixId: string) => Promise<void>;
  resolveInitialRole: (email: string) => "ADMIN" | "USER";
  upsertUser: (input: {
    id: string;
    name: string;
    email: string;
    image_url?: string;
    role: "ADMIN" | "USER";
  }) => Promise<void>;
  updateUser: (input: {
    id: string;
    name: string;
    email: string;
    image_url?: string;
  }) => Promise<void>;
};

function displayName(data: ClerkWebhookEvent["data"]): string {
  return `${data.first_name || ""}${data.last_name ? ` ${data.last_name}` : ""}`.trim();
}

function emailFrom(data: ClerkWebhookEvent["data"]): string {
  return (
    data.email_addresses?.[0]?.email_address ??
    data.primary_email_address?.email_address ??
    ""
  );
}

export type ClerkWebhookResult =
  | { status: 400; body: string }
  | { status: 200; body: string; duplicate?: boolean; handled?: boolean };

/**
 * Pure Clerk webhook pipeline (Svix verify + optional idempotency + handlers).
 * Stripe is not involved here — see /api/webhooks/stripe.
 */
export async function processClerkWebhook(args: {
  payload: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  deps: ClerkWebhookDeps;
}): Promise<ClerkWebhookResult> {
  const { payload, svixId, svixTimestamp, svixSignature, deps } = args;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { status: 400, body: "Missing svix headers" };
  }

  let event: ClerkWebhookEvent;
  try {
    event = deps.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return { status: 400, body: "Invalid signature" };
  }

  if (await deps.hasProcessed(svixId)) {
    return { status: 200, body: "OK", duplicate: true };
  }

  const data = event.data;
  const email = emailFrom(data);
  const name = displayName(data);

  let handled = false;

  if (event.type === "user.created") {
    await deps.upsertUser({
      id: data.id,
      name,
      email,
      image_url: data.image_url,
      role: deps.resolveInitialRole(email),
    });
    handled = true;
  } else if (event.type === "user.updated") {
    await deps.updateUser({
      id: data.id,
      name,
      email,
      image_url: data.image_url,
    });
    handled = true;
  }

  await deps.markProcessed(svixId);

  return { status: 200, body: "OK", handled };
}
