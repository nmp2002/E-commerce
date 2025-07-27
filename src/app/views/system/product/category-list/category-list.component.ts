import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { ProductCategory, Product } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: ProductCategory[] = [];
  products: Product[] = [];
  selectedCategoryId: number | null = null;
  loading = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error('Không thể tải danh sách danh mục');
      }
    });
  }

  getParentCategoryName(parentId: number | undefined): string {
    if (!parentId) return 'Không có';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.categoryName : 'Không có';
  }

  loadProductsByCategory(categoryId: number): void {
    this.loading = true;
    this.selectedCategoryId = categoryId;
    this.productService.getProductsByCategoryId(categoryId).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastr.error('Không thể tải danh sách sản phẩm');
        this.loading = false;
      }
    });
  }

  addCategory(): void {
    this.router.navigate(['/system/product/category/create']);
  }

  editCategory(id: number): void {
    this.router.navigate(['/system/product/category/edit', id]);
  }

  deleteCategory(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.productService.deleteCategory(id).subscribe({
        next: () => {
          this.toastr.success('Xóa danh mục thành công');
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.toastr.error('Lỗi khi xóa danh mục');
        }
      });
    }
  }
}
