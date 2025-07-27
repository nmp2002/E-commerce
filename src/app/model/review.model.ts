export interface ProductReview {
  reviewId: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    avatar?: string;
  };
  product?: {
    id: number;
    productName: string;
    image: string;
  };
}
