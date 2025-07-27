import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { ProductCategory, ProductStatus, Product } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductAttributeService, ProductAttribute as ProductAttributePayload } from '../../../../_services/product-attribute.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss']
})
export class ProductCreateComponent implements OnInit {
  productForm: FormGroup;
  categories: ProductCategory[] = [];
  brands: string[] = ['Apple', 'Samsung', 'Xiaomi', 'OPPO'];
  loading = false;
  submitted = false;
  private currentDefaultAttributes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private productAttributeService: ProductAttributeService,
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      groupCode: ['', Validators.required],
      variants: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      this.setupNewCategory(Number(categoryId));
      // Cập nhật brand theo danh mục
      if (Number(categoryId) === 21) {
        this.brands = ['DELL', 'ASUS', 'ACER', 'LENOVO', 'APPLE', 'HP', 'RAZER'];
      } else {
        this.brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO'];
      }
    });
  }

  private setupNewCategory(categoryId: number): void {
    this.currentDefaultAttributes = this.getDefaultAttributesForCategory(categoryId);
    this.variants.clear();
    this.addVariant(); // Add the first variant for the new category
  }

  private getDefaultAttributesForCategory(categoryId: number): string[] {
    // Assuming ID 1 is Laptop, 2 is Phone.
    switch (categoryId) {
      case 21: // Laptop
        return ['CPU', 'RAM', 'Ổ cứng', 'Card đồ họa (GPU)', 'Màn hình'];
      case 2: // Điện thoại
        return ['Màu sắc', 'Dung lượng', 'RAM', 'Chip', 'Màn hình'];
      default:
        return [];
    }
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  newVariant(): FormGroup {
    const variantGroup = this.fb.group({
      price: [0, [Validators.required, Validators.min(1)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      status: [ProductStatus.ACTIVE, Validators.required],
      image: [null],
      selectedFile: [null],
      previewUrl: [null],
      attributes: this.fb.array([])
    });

    const attributesArray = variantGroup.get('attributes') as FormArray;
    this.currentDefaultAttributes.forEach(attrName => {
      attributesArray.push(this.fb.group({
        name: [attrName], // The name is fixed
        value: ['', Validators.required]
      }));
    });
    return variantGroup;
  }

  addVariant(): void {
    if (this.productForm.get('categoryId')?.value === '') {
        this.toastr.warning('Vui lòng chọn danh mục sản phẩm trước khi thêm phiên bản.');
        return;
    }
    this.variants.push(this.newVariant());
  }

  removeVariant(variantIndex: number): void {
    this.variants.removeAt(variantIndex);
  }

  variantAttributes(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('attributes') as FormArray;
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => this.toastr.error('Không thể tải danh mục sản phẩm')
    });
  }

  onFileSelected(event: any, variantIndex: number): void {
    const file = event.target.files[0];
    const variant = this.variants.at(variantIndex);

    if (file) {
      variant.patchValue({ selectedFile: file });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        variant.patchValue({ previewUrl: e.target.result });
        const base64result: string = e.target.result.toString().split(',')[1];
        if (base64result) {
          variant.patchValue({ image: base64result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastr.warning('Vui lòng kiểm tra lại tất cả các trường của sản phẩm và các phiên bản.');
      return;
    }

    this.loading = true;
    const baseProductInfo = this.productForm.value;

    const createVariantObservables = baseProductInfo.variants.map((variant: any) => {
      const color = variant.attributes.find((attr: any) => attr.name.toLowerCase().includes('màu'))?.value || '';
      const storage = variant.attributes.find((attr: any) => attr.name.toLowerCase().includes('dung lượng'))?.value || '';
      const brand = baseProductInfo.brand || '';
      const variantProductName = `${baseProductInfo.productName} - ${brand} - ${color} - ${storage}`;

      const newProduct: Omit<Product, 'id' | 'attributes'> = {
        productName: variantProductName,
        brand: brand,
        description: baseProductInfo.description,
        categoryId: baseProductInfo.categoryId,
        groupCode: baseProductInfo.groupCode,
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        status: variant.status,
        image: variant.image,
      };

      return this.productService.createProduct(newProduct).pipe(
        switchMap(createdProduct => {
          if (variant.attributes && variant.attributes.length > 0 && createdProduct && createdProduct.id) {
            const attributeRequests = variant.attributes.map((attr: any) => {
              const attributeToSave: ProductAttributePayload = {
                productId: createdProduct.id!,
                attributeName: attr.name,
                attributeValue: attr.value
              };
              return this.productAttributeService.create(attributeToSave);
            });
            return forkJoin(attributeRequests);
          }
          return of(createdProduct); // No attributes to save
        })
      );
    });

    forkJoin(createVariantObservables).subscribe({
      next: () => {
        this.toastr.success(`Tạo thành công ${createVariantObservables.length} phiên bản sản phẩm và các thuộc tính.`);
        this.router.navigate(['/system/product/list']);
      },
      error: (error) => {
        console.error('Error creating product variants:', error);
        this.toastr.error('Tạo sản phẩm thất bại: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // getter for easy access to form fields
  get f() { return this.productForm.controls; }
}
