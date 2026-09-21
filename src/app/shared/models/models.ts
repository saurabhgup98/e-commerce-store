export type ProductCategory =
  | 'smartphone'
  | 'tv'
  | 'mobile_accessory'
  | 'tv_accessory'
  | 'common_accessory';

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  price: number;
  specs: Record<string, string>;
  description: string;
  imagePlaceholder: string;
}

export interface CartItem {
  productId: Product;
  quantity: number;
}

export interface Address {
  _id: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export type OrderStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'return_requested' | 'returned';

export interface OrderItem {
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  addressSnapshot: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  cancelledAt?: string;
  returnRequestedAt?: string;
}

export interface User {
  id: string;
  mobile: string;
  firstName: string;
  lastName: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  smartphone: 'Smartphones',
  tv: 'TVs',
  mobile_accessory: 'Mobile Accessories',
  tv_accessory: 'TV Accessories',
  common_accessory: 'Accessories',
};
