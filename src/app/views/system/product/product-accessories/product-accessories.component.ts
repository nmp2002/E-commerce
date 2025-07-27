import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../_services/product.service';
import { Product, ProductAccessory } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-accessories',
  templateUrl: './product-accessories.component.html',
  styleUrls: ['./product-accessories.component.scss']
})
export class ProductAccessoriesComponent implements OnInit {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  accessories: ProductAccessory[] = [];
  availableAccessories: Product[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  searchKeyword = '';
  selectedCategoryId: number | null = null;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts({
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchKeyword,
      categoryId: this.selectedCategoryId
    }).subscribe({
      next: (response) => {
        this.products = response.items;
        this.totalItems = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách sản phẩm');
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onProductSelect(product: Product): void {
    this.selectedProduct = product;
    this.loadAccessories(product.id!);
    this.loadAvailableAccessories(product.id!);
  }

  loadAccessories(productId: number): void {
    this.loading = true;
    this.productService.getProductAccessories(productId).subscribe({
      next: (accessories) => {
        this.accessories = accessories;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách phụ kiện');
        console.error('Error loading accessories:', error);
        this.loading = false;
      }
    });
  }

  loadAvailableAccessories(productId: number): void {
    this.loading = true;
    this.productService.getAvailableAccessories(productId).subscribe({
      next: (accessories) => {
        this.availableAccessories = accessories;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách phụ kiện có sẵn');
        console.error('Error loading available accessories:', error);
        this.loading = false;
      }
    });
  }

  addAccessory(accessoryId: number): void {
    if (!this.selectedProduct) return;

    this.productService.addProductAccessory(this.selectedProduct.id!, accessoryId).subscribe({
      next: () => {
        this.toastr.success('Thêm phụ kiện thành công');
        this.loadAccessories(this.selectedProduct!.id!);
        this.loadAvailableAccessories(this.selectedProduct!.id!);
      },
      error: (error) => {
        this.toastr.error('Không thể thêm phụ kiện');
        console.error('Error adding accessory:', error);
      }
    });
  }

  removeAccessory(accessoryId: number): void {
    if (!this.selectedProduct) return;

    this.productService.removeProductAccessory(this.selectedProduct.id!, accessoryId).subscribe({
      next: () => {
        this.toastr.success('Xóa phụ kiện thành công');
        this.loadAccessories(this.selectedProduct!.id!);
        this.loadAvailableAccessories(this.selectedProduct!.id!);
      },
      error: (error) => {
        this.toastr.error('Không thể xóa phụ kiện');
        console.error('Error removing accessory:', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }
}
