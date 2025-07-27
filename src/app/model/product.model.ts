export interface Product {
  id?: number;
  productName: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  image?: string;
  categoryId: number;
  status: ProductStatus;
  groupCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
  category?: ProductCategory;
  brand?: string;
  attributes?: ProductAttribute[];
}

export interface ProductCategory {
  id?: number;
  categoryName: string;
  parentId?: number;
  parent?: ProductCategory;
  children?: ProductCategory[];
  level?: number;
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductAttribute {
  id?: number;
  name: string;
  value: string;
}

export enum ProductStatus {
  OUT_OF_STOCK = 0,
  ACTIVE = 1,
  INACTIVE = 2
}

export interface PageResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductAccessory {
  mainProductId: number;
  accessoryProductId: number;
  mainProduct?: Product;
  accessoryProduct?: Product;
}
