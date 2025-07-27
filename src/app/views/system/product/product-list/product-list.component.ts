import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { Product, ProductCategory, ProductStatus, PageResponse } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: ProductCategory[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  searchTerm = '';
  selectedCategory: number | null = null;
  productStatus = ProductStatus;

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm,
      categoryId: this.selectedCategory
    };

    this.productService.getAllProducts(params).subscribe({
      next: (data: PageResponse<Product>) => {
        this.products = data.items;
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastr.error('Lỗi khi tải danh sách sản phẩm');
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'Không có';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.categoryName : 'Không xác định';
  }

  getStatusText(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'Đang hoạt động';
      case ProductStatus.INACTIVE:
        return 'Không hoạt động';
      case ProductStatus.OUT_OF_STOCK:
        return 'Hết hàng';
      default:
        return 'Không xác định';
    }
  }

  search(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  addProduct(): void {
    this.router.navigate(['product/create']);
  }

  viewProduct(id: number): void {
    this.router.navigate(['/product/detail', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/product/edit', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('Xóa sản phẩm thành công');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.toastr.error('Lỗi khi xóa sản phẩm');
        }
      });
    }
  }

  updateProductStatus(id: number, status: ProductStatus): void {
    this.productService.updateProductStatus(id, status).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái thành công');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product status:', error);
        this.toastr.error('Lỗi khi cập nhật trạng thái');
      }
    });
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
