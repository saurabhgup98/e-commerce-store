export const AUTH_COOKIE_NAME = "es_session";

export const PRODUCT_CATEGORIES = [
  "smartphone",
  "tv",
  "mobile_accessory",
  "tv_accessory",
  "common_accessory",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "cancelled",
  "return_requested",
  "returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
