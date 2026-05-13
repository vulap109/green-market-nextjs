export const PRODUCT_IMAGE_UPLOAD_LIMIT = 5;
export const PRODUCT_IMAGE_TOTAL_MAX_BYTES = Math.floor(4.5 * 1024 * 1024);
export const PRODUCT_IMAGE_TOTAL_MAX_LABEL = "4.5MB";
export const PRODUCT_IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PRODUCT_IMAGE_ACCEPT = PRODUCT_IMAGE_ALLOWED_TYPES.join(",");
