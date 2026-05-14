export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  isBlocked: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  savedForLater: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  size?: string;
  image: string;
  images?: string[];
  stock: number;
  active: boolean;
  rating: number;
  ratingsCount: number;
  soldCount: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  coupon?: {
    code: string;
    amount: number;
    discount: number;
  };
  shipping: Address;
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  stripeSessionId?: string;
  returnRequested: boolean;
  returnReason?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  minTotal: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}