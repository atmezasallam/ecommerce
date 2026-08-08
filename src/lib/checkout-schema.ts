import { z } from "zod";

/** Checkout shipping address schema (shared by client form + tests). */
export const CheckoutShippingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  saveAddress: z.boolean(),
});

export type CheckoutShippingInput = z.infer<typeof CheckoutShippingSchema>;
