import { Component, OnInit } from '@angular/core';
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
    Type?: string;
    Wireless?: string;
  };
  stockQuantity?: number;
  shortDescription?: string;
}

@Component({
  selector: 'app-headphone-list',
  templateUrl: './headphone-list.component.html',
  styleUrls: ['./headphone-list.component.scss']
})
export class HeadphoneListComponent implements OnInit {
  isLoggedIn: boolean = false;
  cartId: number | null = null;
  allHeadphones: Product[] = [];
  displayProducts: DisplayProduct[] = [];

  brands: string[] = [];
  types: string[] = [];
  wirelessOptions: string[] = [];

  selectedBrand = '';
  selectedType = '';
  selectedWireless = '';
  searchText = '';
  loading = false;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router,
    private cartService: CartService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
  this.isLoggedIn = !!this.tokenStorage.getUser();
    this.loadHeadphones();
  }

  loadHeadphones(): void {
    this.loading = true;
    this.productService.getProductsByCategoryId(61).subscribe({
      next: (data) => {
        this.allHeadphones = data;
        this.extractFilterOptions();
        this.applyFiltersAndGrouping();
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Không thể tải danh sách tai nghe');
        this.loading = false;
      }
    });
  }

  extractFilterOptions(): void {
    const brands = new Set<string>();
    const types = new Set<string>();
    const wirelessOptions = new Set<string>();
    this.allHeadphones.forEach(product => {
      if (product.brand) brands.add(product.brand);
      product.attributes?.forEach(attr => {
        if (attr.name.toLowerCase() === 'type' || attr.name.toLowerCase() === 'loại') types.add(attr.value);
        if (attr.name.toLowerCase() === 'wireless' || attr.name.toLowerCase() === 'không dây') wirelessOptions.add(attr.value);
      });
    });
    this.brands = Array.from(brands);
    this.types = Array.from(types);
    this.wirelessOptions = Array.from(wirelessOptions);
  }

  applyFiltersAndGrouping(): void {
    const filtered = this.allHeadphones.filter(product => {
      const brandMatch = !this.selectedBrand || (product.brand && product.brand.toLowerCase().includes(this.selectedBrand.toLowerCase()));
      const typeAttr = product.attributes?.find(a => a.name.toLowerCase() === 'type' || a.name.toLowerCase() === 'loại');
      const typeMatch = !this.selectedType || (typeAttr && typeAttr.value.toLowerCase().includes(this.selectedType.toLowerCase()));
      const wirelessAttr = product.attributes?.find(a => a.name.toLowerCase() === 'wireless' || a.name.toLowerCase() === 'không dây');
      const wirelessMatch = !this.selectedWireless || (wirelessAttr && wirelessAttr.value.toLowerCase().includes(this.selectedWireless.toLowerCase()));
      const searchMatch = !this.searchText || product.productName.toLowerCase().includes(this.searchText.toLowerCase());
      return brandMatch && typeMatch && wirelessMatch && searchMatch;
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
      const typeAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'type' || a.name.toLowerCase() === 'loại');
      const wirelessAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'wireless' || a.name.toLowerCase() === 'không dây');
      return {
        groupCode: representative.groupCode || `product-${representative.id}`,
        name: representative.groupCode || representative.productName,
        image: representative.image,
        brand: representative.brand,
        minPrice,
        maxPrice,
        representativeId: representative.id,
        attributes: {
          Type: typeAttr?.value,
          Wireless: wirelessAttr?.value
        },
        stockQuantity: group.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
        shortDescription: representative.description ? representative.description.split('.')[0] : ''
      };
    });
  }

  onFilterChange(): void {
    this.applyFiltersAndGrouping();
  }

  viewProduct(id: number): void {
    if (id) {
      this.router.navigate(['/product/detail', id]);
    }
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!this.tokenStorage.getUser()) {
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

  buyNow(product: any): void {
    if (!this.tokenStorage.getUser()) {
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
      image: product.image,
      quantity: 1,
      price: product.minPrice,
      selected: true
    };
    this.router.navigate(['/checkout'], {
      state: { selectedItems: [checkoutItem] }
    });
  }
}
