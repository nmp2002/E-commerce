import { Component, Input, OnInit } from '@angular/core';
import { ProductService } from '../../../_services/product.service';
import { Product } from '../../../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CartService } from '../../../_services/cart.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

interface DisplayProduct {
  groupCode: string;
  name: string;
  image?: string;
  brand?: string;
  minPrice: number;
  maxPrice: number;
  representativeId?: number;
  attributes?: {
    Color?: string;
    Storage?: string;
    RAM?: string;
  };
  stockQuantity?: number;
  shortDescription?: string;
}

@Component({
  selector: 'app-product-category-list',
  templateUrl: './product-category-list.component.html',
  styleUrls: ['./product-category-list.component.scss']
})
export class ProductCategoryListComponent implements OnInit {
  @Input() categoryType: 'laptop' | 'phone' = 'laptop';

  cartId: number | null = null;
  allProducts: Product[] = [];
  displayProducts: DisplayProduct[] = [];

  brands: string[] = [];
  rams: string[] = [];
  storages: string[] = [];

  selectedBrand = '';
  selectedRam = '';
  selectedStorage = '';
  searchText = '';
  loading = false;

  compareList: Product[] = [];
  selectedGroupCode: string | null = null;
  isLoggedIn: boolean = false;
  currentProduct: Product | null = null;
  quantity: number = 1;
  minPrice: number = 0;
  maxPrice: number = 0;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router,
    private cartService: CartService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
  this.isLoggedIn = !!this.tokenStorage.getUser();
    this.isLoggedIn = !!this.tokenStorage.getUser();
    this.loadSearchFilters();
    this.loadProducts();
  }

  get categoryId(): number {
    return this.categoryType === 'laptop' ? 21 : 2;
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProductsByCategoryId(this.categoryId).subscribe({
      next: (data) => {
        this.allProducts = data;
        this.extractFilterOptions();
        this.applyFiltersAndGrouping();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách sản phẩm');
        this.loading = false;
      }
    });
  }

  extractFilterOptions(): void {
    const brands = new Set<string>();
    const rams = new Set<string>();
    const storages = new Set<string>();
    this.allProducts.forEach(product => {
      if (product.brand) brands.add(product.brand);
      product.attributes?.forEach(attr => {
        if (attr.name.toLowerCase() === 'ram') rams.add(attr.value);
        if (attr.name.toLowerCase() === 'storage' || attr.name.toLowerCase() === 'ổ cứng') storages.add(attr.value);
      });
    });
    this.brands = Array.from(brands);
    this.rams = Array.from(rams);
    this.storages = Array.from(storages);
  }

  parseRam(productName: string): string | null {
    const ramRegex = /(\d+)gb/i;
    const match = productName.match(ramRegex);
    return match ? match[1] + 'GB' : null;
  }

  parseStorage(productName: string): string | null {
    const storageRegex = /(\d+)gb/i;
    const match = productName.match(storageRegex);
    return match ? match[1] + 'GB' : null;
  }

  applyFiltersAndGrouping(): void {
    const filtered = this.allProducts.filter(product => {
      const brandMatch = !this.selectedBrand || (product.brand && product.brand.toLowerCase().includes(this.selectedBrand.toLowerCase()));
      const parsedRam = this.parseRam(product.productName);
      const ramMatch = !this.selectedRam || (parsedRam !== null && parsedRam.toLowerCase().includes(this.selectedRam.toLowerCase()));
      const parsedStorage = this.parseStorage(product.productName);
      const storageMatch = !this.selectedStorage || (parsedStorage !== null && parsedStorage.toLowerCase().includes(this.selectedStorage.toLowerCase()));
      const searchMatch = !this.searchText || product.productName.toLowerCase().includes(this.searchText.toLowerCase());
      const priceMatch = !this.minPrice && !this.maxPrice ||
                        (product.price >= this.minPrice && product.price <= this.maxPrice);
      return brandMatch && ramMatch && storageMatch && searchMatch && priceMatch;
    });
    const grouped = new Map<string, Product[]>();
    filtered.forEach(product => {
      const groupKey = product.groupCode || `product-${product.id}`;
      const group = grouped.get(groupKey);
      if (group) {
        group.push(product);
      } else {
        grouped.set(groupKey, [product]);
      }
    });
    this.displayProducts = Array.from(grouped.values()).map(group => {
      const representative = group[0];
      const prices = group.map(p => p.price).filter(p => typeof p === 'number');
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const colorAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'color');
      const storageAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'storage' || a.name.toLowerCase() === 'ổ cứng');
      const ramAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'ram');
      const totalStock = group.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
      const shortDescription = representative.description ? representative.description.split('.')[0] : '';
      const baseName = representative.productName.split('-')[0].trim();
      return {
        groupCode: representative.groupCode || `product-${representative.id}`,
        name: representative.groupCode || baseName,
        image: representative.image,
        brand: representative.brand,
        minPrice,
        maxPrice,
        representativeId: representative.id,
        attributes: {
          Color: colorAttr?.value,
          Storage: storageAttr?.value,
          RAM: ramAttr?.value
        },
        stockQuantity: totalStock,
        shortDescription
      };
    });
  }

  onFilterChange(): void {
    this.applyFiltersAndGrouping();
  }

  addToCompare(product: Product): void {
    if (!this.compareList.find(p => p.id === product.id) && this.compareList.length < 3) {
      this.compareList.push(product);
    }
  }

  removeFromCompare(product: Product): void {
    this.compareList = this.compareList.filter(p => p.id !== product.id);
  }

  clearCompare(): void {
    this.compareList = [];
  }

  isInCompareList(product: Product): boolean {
    return this.compareList.some(p => p.id === product.id);
  }

  getRatingValue(product: Product): number {
    const ratingAttribute = product.attributes?.find(a => a.name === 'Rating');
    const ratingValue = ratingAttribute ? parseFloat(ratingAttribute.value) : 0;
    return isNaN(ratingValue) ? 0 : ratingValue;
  }

  getAttributeValue(product: Product, attributeName: string): string {
    const attr = product.attributes?.find(a => a.name === attributeName);
    return attr ? attr.value : 'N/A';
  }

  openVariantsModal(groupCode: string): void {
    this.selectedGroupCode = groupCode;
  }

  onCloseModal(): void {
    this.selectedGroupCode = null;
  }

  viewProduct(id: number): void {
    if (id) {
      this.router.navigate(['/product/detail', id]);
      this.onCloseModal();
    }
  }

  getCartId(userId: number): void {
    this.cartService.getCart(userId).subscribe({
      next: cart => {
        this.cartId = cart.cartId || cart.id;
      },
      error: (error) => {
        this.toastr.error('Không thể lấy ID giỏ hàng');
      }
    });
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      this.router.navigate(['/login']);
      return;
    }
    const user = this.tokenStorage.getUser();
    if (!user || !user.id) {
      this.toastr.error('Không thể xác định người dùng');
      return;
    }
    this.cartService.addToCart(user.id, product.representativeId, quantity).subscribe({
      next: () => {
        this.toastr.success('Đã thêm sản phẩm vào giỏ hàng');
      },
      error: () => {
        this.toastr.error('Không thể thêm sản phẩm vào giỏ hàng');
      }
    });
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image || image.trim() === '') return '';
    if (image.startsWith('/9j/')) return 'data:image/jpeg;base64,' + image;
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return 'http://localhost:8080' + image;
    return image;
  }

  buyNow(product: any): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Vui lòng đăng nhập để mua sản phẩm');
      this.router.navigate(['/login']);
      return;
    }
    const user = this.tokenStorage.getUser();
    if (!user || !user.id) {
      this.toastr.error('Không thể xác định người dùng');
      return;
    }
    const checkoutItem = {
      id: product.representativeId,
      name: product.name,
      image: this.getImageUrl(product.image),
      quantity: 1,
      price: product.minPrice,
      selected: true
    };
    this.router.navigate(['/checkout'], {
      state: { selectedItems: [checkoutItem] }
    });
  }

  loadSearchFilters(): void {
    const searchData = sessionStorage.getItem('searchFormData');
    if (searchData) {
      try {
        const filters = JSON.parse(searchData);
        if (filters.brand) {
          this.selectedBrand = filters.brand;
        }
        if (filters.search) {
          this.searchText = filters.search;
        }
        this.minPrice = filters.minPrice || 0;
        this.maxPrice = filters.maxPrice || 0;
        sessionStorage.removeItem('searchFormData');
      } catch (error) {}
    }
  }
}
