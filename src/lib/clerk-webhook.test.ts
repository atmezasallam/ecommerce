import { describe, expect, it, vi } from "vitest";

import {
  processClerkWebhook,
  type ClerkWebhookDeps,
  type ClerkWebhookEvent,
} from "@/src/lib/clerk-webhook";

function baseDeps(
  overrides: Partial<ClerkWebhookDeps> = {}
): ClerkWebhookDeps {
  const processed = new Set<string>();
  return {
    verify: vi.fn(() => ({
      type: "user.created",
      data: {
        id: "user_1",
        email_addresses: [{ email_address: "a@example.com" }],
        first_name: "Ada",
        last_name: "Lovelace",
      },
    })) as ClerkWebhookDeps["verify"],
    hasProcessed: async (id) => processed.has(id),
    markProcessed: async (id) => {
      processed.add(id);
    },
    resolveInitialRole: () => "USER",
    upsertUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("Clerk webhook (Svix mocked)", () => {
  it("accepts a valid signature and handles user.created", async () => {
    const deps = baseDeps();
    const result = await processClerkWebhook({
      payload: "{}",
      svixId: "msg_1",
      svixTimestamp: "123",
      svixSignature: "v1,valid",
      deps,
    });
    expect(result).toMatchObject({ status: 200, handled: true });
    expect(deps.upsertUser).toHaveBeenCalledOnce();
  });

  it("rejects an invalid signature", async () => {
    const deps = baseDeps({
      verify: () => {
        throw new Error("bad sig");
      },
    });
    const result = await processClerkWebhook({
      payload: "{}",
      svixId: "msg_2",
      svixTimestamp: "123",
      svixSignature: "v1,bad",
      deps,
    });
    expect(result).toEqual({ status: 400, body: "Invalid signature" });
    expect(deps.upsertUser).not.toHaveBeenCalled();
  });

  it("is idempotent on duplicate svix event id", async () => {
    const deps = baseDeps();
    const args = {
      payload: "{}",
      svixId: "msg_dup",
      svixTimestamp: "123",
      svixSignature: "v1,ok",
      deps,
    };
    await processClerkWebhook(args);
    const second = await processClerkWebhook(args);
    expect(second).toMatchObject({ status: 200, duplicate: true });
    expect(deps.upsertUser).toHaveBeenCalledOnce();
  });

  it("acknowledges unhandled event types without writing users", async () => {
    const deps = baseDeps({
      verify: () =>
        ({
          type: "session.created",
          data: { id: "sess_1" },
        }) as ClerkWebhookEvent,
    });
    const result = await processClerkWebhook({
      payload: "{}",
      svixId: "msg_3",
      svixTimestamp: "123",
      svixSignature: "v1,ok",
      deps,
    });
    expect(result).toMatchObject({ status: 200, handled: false });
    expect(deps.upsertUser).not.toHaveBeenCalled();
    expect(deps.updateUser).not.toHaveBeenCalled();
  });
});
