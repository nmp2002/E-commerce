export interface Cart {
  id: number;
  cartId: number;
  userId: number;
  createdAt: Date;
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    productName: string;
    price: number;
    image: string;
  };
}
