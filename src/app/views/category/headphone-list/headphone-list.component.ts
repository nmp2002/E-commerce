import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../_services/product.service';
import { Product } from '../../../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CartService } from '../../../_services/cart.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import Swal from 'sweetalert2';

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
  // Kiểm tra đăng nhập động mỗi lần gọi
  get isLoggedIn(): boolean {
    const token = this.tokenStorage.getToken();
    const isLoggedIn = !!token;
    console.log('isLoggedIn check - Token exists:', isLoggedIn);
    return isLoggedIn;
  }
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
    console.log('Component initialized, isLoggedIn:', this.isLoggedIn);
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

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param product Sản phẩm cần thêm vào giỏ hàng
   * @param quantity Số lượng sản phẩm (mặc định là 1)
   */
  addToCart(product: DisplayProduct, quantity: number = 1, event?: Event): void {
    console.log('addToCart called', {product, isLoggedIn: this.isLoggedIn});
    if (event) {
      event.stopPropagation();
      console.log('Event stopped from propagating');
    }
    
    // Kiểm tra đăng nhập
    if (!this.isLoggedIn) {
      console.log('User not logged in, showing login required');
      this.showLoginRequired('thêm sản phẩm vào giỏ hàng');
      return;
    }

    if (!product || !product.representativeId) {
      this.toastr.error('Không tìm thấy thông tin sản phẩm', 'Lỗi');
      return;
    }

    const user = this.tokenStorage.getUser();
    if (!user || !user.id) {
      this.toastr.error('Không thể xác định người dùng', 'Lỗi');
      return;
    }

    // Gọi API thêm vào giỏ hàng
    this.cartService.addToCart(user.id, product.representativeId, quantity).subscribe({
      next: (response) => {
        console.log('Added to cart:', response);
        this.toastr.success('Đã thêm sản phẩm vào giỏ hàng', 'Thành công');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.toastr.error('Không thể thêm sản phẩm vào giỏ hàng', 'Lỗi');
      }
    });
  }

  /**
   * Xử lý sự kiện mua ngay
   * @param product Sản phẩm cần mua
   */
  buyNow(product: DisplayProduct, event?: Event): void {
    console.log('buyNow called', {product, isLoggedIn: this.isLoggedIn});
    if (event) {
      event.stopPropagation();
      console.log('Event stopped from propagating');
    }
    
    // Kiểm tra đăng nhập
    if (!this.isLoggedIn) {
      console.log('User not logged in, showing login required');
      this.showLoginRequired('tiến hành mua hàng');
      return;
    }

    if (!product || !product.representativeId) {
      this.toastr.error('Không tìm thấy thông tin sản phẩm', 'Lỗi');
      return;
    }

    const user = this.tokenStorage.getUser();
    if (!user || !user.id) {
      this.toastr.error('Không thể xác định người dùng', 'Lỗi');
      return;
    }

    // Thêm vào giỏ hàng trước khi chuyển đến trang thanh toán
    this.cartService.addToCart(user.id, product.representativeId, 1).subscribe({
      next: () => {
        // Tạo checkout item từ product group
        const checkoutItem = {
          id: product.representativeId,
          name: product.name,
          image: this.getImageUrl(product.image),
          quantity: 1,
          price: product.minPrice, // Sử dụng giá thấp nhất
          selected: true
        };

        // Chuyển đến trang checkout với sản phẩm được chọn
        this.router.navigate(['/checkout'], {
          state: { selectedItems: [checkoutItem] }
        });
      },
      error: (err) => {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
        this.toastr.error('Có lỗi xảy ra khi xử lý đơn hàng', 'Lỗi');
      }
    });
  }

  /**
   * Lấy URL hình ảnh đầy đủ
   * @param image Đường dẫn ảnh hoặc base64
   */
  getImageUrl(image: string | null | undefined): string {
    if (!image || image.trim() === '') return '';
    if (image.startsWith('/9j/')) return 'data:image/jpeg;base64,' + image; // base64 JPEG
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return 'http://localhost:8080' + image;
    return image;
  }

  /**
   * Hiển thị thông báo yêu cầu đăng nhập
   * @param action Hành động yêu cầu đăng nhập
   */
  private showLoginRequired(action: string): void {
    console.log('showLoginRequired called with action:', action);
    
    Swal.fire({
      title: '<strong>Yêu cầu đăng nhập</strong>',
      html: `
        <div style="text-align: center;">
          <i class="fas fa-user-lock" style="font-size: 50px; color: #3085d6; margin-bottom: 20px;"></i>
          <p style="font-size: 18px; margin-bottom: 20px;">
            Vui lòng đăng nhập để ${action}
          </p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-sign-in-alt"></i> Đăng nhập',
      cancelButtonText: '<i class="fas fa-times"></i> Hủy',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      showCloseButton: true,
      focusConfirm: false,
      customClass: {
        popup: 'login-required-popup',
        confirmButton: 'btn-confirm',
        cancelButton: 'btn-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('User confirmed login');
        this.router.navigate(['/login'], { 
          queryParams: { 
            returnUrl: this.router.routerState.snapshot.url 
          }
        });
      } else {
        console.log('User cancelled login');
      }
    });
  }
}
