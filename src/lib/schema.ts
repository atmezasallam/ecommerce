
import * as z from "zod";
import { getPlainTextLength } from "./utils";

// Category form schema
export const CategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name must be at least 2 characters long")
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Category name must only contain letters, numbers, spaces, and hyphens"
    ),

image:z.object({
url:z.string(),
})
.array().length(1,"Choose a category image."),

url: z
    .string()
    .min(1, "only letters,numbers,hyphens,and underscore are allowed")
    .min(2, "Category url must be at least 2 characters long")
    .max(50, "Category url must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Category url must only contain letters, numbers, spaces, and hyphens"
    ),

    featured:z.boolean().default(false),

});








//subcategory


export const SubCategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "SubCategory name must be at least 2 characters long")
    .min(2, "SubCategory name must be at least 2 characters long")
    .max(50, "SubCategory name must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "SubCategory name must only contain letters, numbers, spaces, and hyphens"
    ),

image:z.object({
url:z.string(),
})
.array().length(1,"Choose a Subcategory image."),

url: z
    .string()
    .min(1, "only letters,numbers,hyphens,and underscore are allowed")
    .min(2, "SubCategory url must be at least 2 characters long")
    .max(50, "SubCategory url must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "SubCategory url must only contain letters, numbers, spaces, and hyphens"
    ),

    featured:z.boolean().default(false),
     categoryId:z.string().uuid(),
});






//Store schema 


export const StoreFormSchema = z.object({
  // NAME
  name: z
    .string()
    .min(1, { message: "Store name is required" }) // required
    .min(2, { message: "Store name must be at least 2 characters long." })
    .max(50, { message: "Store name cannot exceed 50 characters." }),

  // DESCRIPTION
  description: z
    .string()
    .min(1, { message: "Store description is required" }) // required
    .min(30, {
      message: "Store description must be at least 30 characters long.",
    })
    .max(500, {
      message: "Store description cannot exceed 500 characters.",
    }),

  // EMAIL
  email: z
    .string()
    .min(1, { message: "Store email is required" }) // required
    .email({ message: "Invalid email format." }),

  // PHONE
  phone: z
    .string()
    .min(1, { message: "Store phone number is required" }) // required
    .regex(/^\+?\d+$/, {
      message: "Invalid phone number format.",
    }),

  // LOGO
  logo: z
    .object({ url: z.string() })
    .array()
    .length(1, { message: "Choose a logo image." }),

  // COVER
  cover: z
    .object({ url: z.string() })
    .array()
    .length(1, { message: "Choose a cover image." }),

  // URL (slug)
  url: z
    .string()
    .min(1, { message: "Store url is required" }) // required
    .min(2, { message: "Store url must be at least 2 characters long." })
    .max(50, { message: "Store url cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        "Only letters, numbers, hyphen, and underscore are allowed in the store url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
    }),

  // FEATURED & STATUS
  featured: z.boolean().default(false).optional(),
  status: z.string().default("PENDING").optional(),
});







//product schema


export const ProductFormSchema = z.object({
  // NAME
  name: z
    .string()
    .min(1, { message: "Product name is required." })
    .min(2, { message: "Product name should be at least 2 characters long." })
    .max(200, { message: "Product name cannot exceed 200 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_ -]+$/, {
      message:
        "Only letters, numbers, spaces, hyphens, and underscores are allowed, without consecutive special characters.",
    }),

  // DESCRIPTION
  description: z
    .string()
    .min(1, { message: "Product description is required." })
    .refine(
      (html) => {
        const plainTextLength = getPlainTextLength(html);
        return plainTextLength >= 30;
      },
      {
        message: "Product description should be at least 30 characters long.",
      }
    ),

  // VARIANT NAME
  variantName: z
    .string()
    .min(1, { message: "Variant name is required." })
    .min(2, { message: "Variant name must be at least 2 characters long." })
    .max(100, {
      message: "Variant name cannot exceed 100 characters.",
    })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_ -]+$/, {
      message:
        "Only letters, numbers, spaces, hyphens, and underscores are allowed, without consecutive special characters.",
    }),

  // VARIANT DESCRIPTION
  variantDescription: z.string().optional(),

  // IMAGES
  images: z
    .object({ url: z.string() })
    .array()
    .min(3, { message: "Please upload at least 3 product images." })
    .max(6, { message: "You can upload up to 6 images." }),

  // VARIANT IMAGE
  variantImages: z
    .object({ url: z.string() })
    .array()
    .length(1, { message: "Choose a variant image." }),



  // CATEGORY
  categoryId: z.string().min(1, { message: "Product category is required." }),

  // SUBCATEGORY
  subCategoryId: z
    .string()
    .min(1, { message: "Product sub-category is required." }),

  // OFFER TAG (OPTIONAL)


  // BRAND
  brand: z
    .string()
    .min(1, { message: "Product brand is required." })
    .min(2, { message: "Brand must be at least 2 characters." })
    .max(50, { message: "Brand cannot exceed 50 characters." }),

  // SKU
  sku: z
    .string()
    .min(1, { message: "SKU is required." })
    .min(6, { message: "SKU must be at least 6 characters." })
    .max(50, { message: "SKU cannot exceed 50 characters." }),

  // WEIGHT (optional in UI: 0 / empty input sends 0 → treat as default 0.01 kg)
  weight: z
    .number()
    .transform((w) =>
      !Number.isFinite(w) || w < 0.01 ? 0.01 : Math.min(w, 1_000_000)
    ),
  

  // KEYWORDS
  keywords: z
    .string()
    .array()
    .max(10, { message: "Maximum 10 keywords allowed." }),

  // COLORS
  colors: z
    .object({ color: z.string() })
    .array()
    .min(1, { message: "At least one color is required." })
    .refine((colors) => colors.every((c) => c.color.length > 0), {
     message: "All color fields must be filled.",
    }),



  // IS SALE (هل المنتج عليه خصم؟)
  isSale: z.boolean().default(false),

  // SALE END DATE (اختياري)
saleEndDate: z.string().optional(),

  // FREE SHIPPING TO ALL COUNTRIES


  // FREE SHIPPING COUNTRIES IDS




  // SIZES
  sizes: z
    .object({
      size: z.string().min(1, { message: "Size is required." }),
      quantity: z.number().min(1, { message: "Quantity must be greater than 0." }),
      price: z.number().min(0.01, { message: "Price must be greater than 0." }),
      discount: z.number().min(0).default(0),
    })
    .array()
    .min(1, { message: "At least one size is required." })
    .refine(
      (sizes) =>
        sizes.every(
          (s) => s.size.trim().length > 0 && s.price > 0 && s.quantity > 0
        ),
      {
        message: "Please fill in all fields: Size, Price, Discount, and Quantity for each size option.",
      }
    ),




    product_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, "Please provide at least one product spec.")
    .refine(
      (product_specs) =>
        product_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      {
        message: "All product specs inputs must be filled correctly.",
      }
    ),

    variant_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, "Please provide at least one product variant spec.")
    .refine(
      (product_specs) =>
        product_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      {
        message: "All product variant specs inputs must be filled correctly.",
      }
    ),
});



// Offer Tag form schema
export const OfferTagFormSchema = z.object({
  name: z
    .string()
    .min(1, "Offer tag name is required")
    .min(2, "Offer tag name must be at least 2 characters long")
    .max(100, "Offer tag name must be at most 100 characters long"),
  url: z
    .string()
    .min(1, "Offer tag URL is required")
    .url("Please provide a valid URL format (e.g., https://example.com)"),

    //QUESTIONS
    questions: z
    .object({
      question: z.string(),
      answer: z.string(),
    })
    .array()
    .min(1, "Please provide at least one product question.")
    .refine(
      (questions) =>
        questions.every((q) => q.question.length > 0 && q.answer.length > 0),
      {
        message: "All product question inputs must be filled correctly.",
      }
    ),





  });

  



  // Store shipping details
export const StoreShippingFormSchema = z.object({
  defaultShippingService: z
    .string()
    .min(2, "Shipping service name must be at least 2 characters long.")
    .max(50, { message: "Shipping service name cannot exceed 50 characters." }),
  defaultShippingFeePerItem: z.number(),
  defaultShippingFeeForAdditionalItem: z.number(),
  defaultShippingFeePerKg: z.number(),
  defaultShippingFeeFixed: z.number(),
  defaultDeliveryTimeMin: z.number(),
  defaultDeliveryTimeMax: z.number(),
  returnPolicy: z.string(),
});



export const ShippingRateFormSchema = z.object({
  shippingService: z
    .string()
    .min(2, {
      message: "Shipping service name must be at least 2 characters long.",
    })
    .max(50, { message: "Shipping service name cannot exceed 50 characters." }),
  countryId: z.string().uuid().optional(),
  countryName: z.string().optional(),
  shippingFeePerItem: z.number(),

  shippingFeeForAdditionalItem: z.number(),
  shippingFeePerKg: z.number(),
  shippingFeeFixed: z.number(),
  deliveryTimeMin: z.number(),
  deliveryTimeMax: z.number(),
  returnPolicy: z.string().min(1, "Return policy is required."),
});



// Add review schema
export const AddReviewSchema = z.object({
  variantName: z.string().min(1, "Variant is required."),
  rating: z.number().min(1, "Please rate this product."),
  size: z.string().min(1, "Please select a size."), // Ensures size cannot be empty
  review: z
    .string()
    .min(
      10,
      "Your feedback matters! Please write a review of minimum 10 characters."
    ), // Ensures review cannot be empty
  quantity: z.string().min(1, "Quantity is required."),
  images: z
    .object({ url: z.string() })
    .array()
    .max(3, "You can upload up to 3 images for the review."),
  color: z.string().min(1, "Color is required."),
});
