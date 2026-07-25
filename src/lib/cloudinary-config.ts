/** Client-safe Cloudinary upload preset — set via NEXT_PUBLIC_CLOUDINARY_PRESET_NAME. */
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME ?? "";
