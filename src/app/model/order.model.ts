export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: number;
  userId: number;
  userName?: string;
  customerName?: string;
  orderDate: Date;
  status: number; // đổi sang number
  totalAmount: number;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    productName: string;
    image: string;
    category?: {
      name: string;
    }
  };
}
