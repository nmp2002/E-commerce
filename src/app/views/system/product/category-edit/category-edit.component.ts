import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { ProductCategory } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {
  category: ProductCategory = {
    id: 0,
    categoryName: '',
    parentId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  categories: ProductCategory[] = [];
  loading = false;
  categoryService: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(Number(id));
    }
    this.loadCategories();
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (data:any) => {
        this.category = data;
        this.loading = false;
      },
      error: (error:any) => {
        console.error('Error loading category:', error);
        this.toastr.error('Lỗi khi tải thông tin danh mục: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
        this.router.navigate(['/system/product/category/list']);
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error:any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.category.id) {
      this.categoryService.updateCategory(this.category.id, this.category).subscribe({
        next: () => {
          this.toastr.success('Cập nhật danh mục thành công');
          this.router.navigate(['/system/product/category/list']);
        },
        error: (error:any) => {
          console.error('Error updating category:', error);
          this.toastr.error('Lỗi khi cập nhật danh mục: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
    } else {
      this.categoryService.createCategory(this.category).subscribe({
        next: () => {
          this.toastr.success('Tạo mới danh mục thành công');
          this.router.navigate(['/system/product/category/list']);
        },
        error: (error:any) => {
          console.error('Error creating category:', error);
          this.toastr.error('Lỗi khi tạo mới danh mục: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/system/product/category/list']);
  }
}
