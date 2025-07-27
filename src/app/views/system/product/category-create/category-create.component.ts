import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { ProductCategory } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent implements OnInit {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      parentId: [null]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const category: ProductCategory = {
      categoryName: this.categoryForm.get('categoryName')?.value,
      parentId: this.categoryForm.get('parentId')?.value,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.loading = true;
    this.productService.createCategory(category).subscribe({
      next: (response) => {
        this.toastr.success('Tạo danh mục thành công');
        this.router.navigate(['/system/product/category/list']);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.toastr.error('Lỗi khi tạo danh mục: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/system/product/category/list']);
  }
}
