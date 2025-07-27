import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { Product, ProductCategory, ProductStatus, PageResponse, ProductAccessory } from '../model/product.model';
import { environment } from '../../environments/environment';

interface ProductQueryParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  // Product methods
  getAllProducts(params: ProductQueryParams = {}): Observable<PageResponse<Product>> {
    const { page = 1, size = 10, search = '', categoryId = null } = params;
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (search) url += `&search=${search}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return this.http.get<PageResponse<Product>>(url);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Lấy sản phẩm và các phiên bản của nó
  getProductAndVariants(productId: number): Observable<{ mainProduct: Product | null, variants: Product[] }> {
    return this.getProductById(productId).pipe(
      switchMap(product => {
        if (!product) {
          return of({ mainProduct: null, variants: [] });
        }
        if (product.groupCode) {
          return this.getProductsByGroupCode(product.groupCode).pipe(
            map(variants => ({ mainProduct: product, variants: variants.length > 0 ? variants : [product] }))
          );
        } else {
          // Nếu không có group code, sản phẩm này đứng một mình
          return of({ mainProduct: product, variants: [product] });
        }
      })
    );
  }

  // Cập nhật trạng thái sản phẩm
  updateProductStatus(id: number, status: ProductStatus): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Lấy tất cả sản phẩm theo categoryId
  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  // Tìm kiếm sản phẩm theo tên
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  // Lấy sản phẩm theo groupCode
  getProductsByGroupCode(groupCode: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/group/${groupCode}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  // Category methods
  getAllCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.categoryUrl).pipe(
      map(categories => this.buildCategoryTree(categories))
    );
  }

  getCategoryById(id: number): Observable<ProductCategory> {
    return this.http.get<ProductCategory>(`${this.categoryUrl}/${id}`);
  }

  getParentCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.categoryUrl}/parents`);
  }

  getChildCategories(parentId: number): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.categoryUrl}/${parentId}/children`);
  }

  createCategory(category: Omit<ProductCategory, 'id'>): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(this.categoryUrl, category);
  }

  updateCategory(id: number, category: Partial<ProductCategory>): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(`${this.categoryUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/${id}`);
  }

  moveCategory(categoryId: number, newParentId: number | null): Observable<ProductCategory> {
    return this.http.patch<ProductCategory>(`${this.categoryUrl}/${categoryId}/move`, { parentId: newParentId });
  }

  // Helper method to build category tree
  private buildCategoryTree(categories: ProductCategory[]): ProductCategory[] {
    const categoryMap = new Map<number, ProductCategory>();
    const rootCategories: ProductCategory[] = [];

    // First pass: Create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id!, { ...category, children: [] });
    });

    // Second pass: Build tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id!)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
          categoryWithChildren.parent = parent;
          categoryWithChildren.level = (parent.level || 0) + 1;
        }
      } else {
        categoryWithChildren.level = 0;
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  // Product accessory methods
  getProductAccessories(productId: number): Observable<ProductAccessory[]> {
    return this.http.get<ProductAccessory[]>(`${this.apiUrl}/${productId}/accessories`);
  }

  getAvailableAccessories(productId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${productId}/available-accessories`);
  }

  addProductAccessory(productId: number, accessoryId: number): Observable<ProductAccessory> {
    return this.http.post<ProductAccessory>(`${this.apiUrl}/${productId}/accessories`, { accessoryId });
  }

  removeProductAccessory(productId: number, accessoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/accessories/${accessoryId}`);
  }
}
