export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}
