import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../_services/product.service';
import { ProductAttributeService, ProductAttribute as ProductAttributePayload } from '../../../../_services/product-attribute.service';
import { Product, ProductStatus, ProductAttribute, ProductCategory } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {
  productForm: FormGroup;
  categories: ProductCategory[] = [];
  attributes: ProductAttribute[] = [];
  productId: number;
  loading = false;
  productStatus = ProductStatus;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private productAttributeService: ProductAttributeService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      status: [ProductStatus.ACTIVE, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadProduct();
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        this.toastr.error('Lỗi khi tải danh mục');
      }
    );
  }

  loadProduct(): void {
    // Load both product data and its attributes
    forkJoin({
      product: this.productService.getProductById(this.productId),
      attributes: this.productAttributeService.getByProductId(this.productId)
    }).subscribe(
      ({ product, attributes }) => {
        // Set form values
        this.productForm.patchValue({
          productName: product.productName,
          categoryId: product.categoryId,
          price: product.price,
          stockQuantity: product.stockQuantity,
          status: product.status,
          image: product.image || ''
        });

        // Map backend attributes to frontend model
        this.attributes = attributes.map((attr: ProductAttributePayload) => ({
          name: attr.attributeName,
          value: attr.attributeValue
        }));

        console.log('Loaded product attributes:', this.attributes);
      },
      (error) => {
        console.error('Error loading product data:', error);
        this.toastr.error('Lỗi khi tải thông tin sản phẩm');
      }
    );
  }

  addAttribute(): void {
    this.attributes.push({ name: '', value: '' });
  }

  removeAttribute(index: number): void {
    this.attributes.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const productData: Product = {
        ...this.productForm.value,
        id: this.productId
      };

      // First update the product
      this.productService.updateProduct(this.productId, productData).pipe(
        switchMap(() => {
          // Then update the attributes
          if (this.attributes && this.attributes.length > 0) {
            // First, get existing attributes to know which ones to delete
            return this.productAttributeService.getByProductId(this.productId).pipe(
              switchMap(existingAttributes => {
                // Delete existing attributes
                const deleteObservables = existingAttributes.map(attr =>
                  this.productAttributeService.delete(attr.id!)
                );

                // Create new attributes
                const createObservables = this.attributes.map(attr => {
                  const attributePayload: ProductAttributePayload = {
                    productId: this.productId,
                    attributeName: attr.name,
                    attributeValue: attr.value
                  };
                  return this.productAttributeService.create(attributePayload);
                });

                return forkJoin([
                  ...deleteObservables,
                  ...createObservables
                ]);
              })
            );
          } else {
            // If no attributes, just delete all existing ones
            return this.productAttributeService.getByProductId(this.productId).pipe(
              switchMap(existingAttributes => {
                const deleteObservables = existingAttributes.map(attr =>
                  this.productAttributeService.delete(attr.id!)
                );
                return forkJoin(deleteObservables);
              })
            );
          }
        })
      ).subscribe(
        () => {
          this.toastr.success('Cập nhật sản phẩm thành công');
          this.router.navigate(['/system/product/list']);
        },
        (error) => {
          console.error('Error updating product:', error);
          this.toastr.error('Lỗi khi cập nhật sản phẩm');
          this.loading = false;
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/system/product/list']);
  }
}
