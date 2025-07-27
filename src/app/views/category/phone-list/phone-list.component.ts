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
    Storage?: string;
    RAM?: string;
  };
  stockQuantity?: number;
  shortDescription?: string;
}

@Component({
  selector: 'app-phone-list',
  templateUrl: './phone-list.component.html',
  styleUrls: ['./phone-list.component.scss']
})
export class PhoneListComponent implements OnInit {
  cartId: number | null = null;
  allPhones: Product[] = [];
  displayProducts: DisplayProduct[] = [];

  brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'];
  rams = ['8GB', '12GB'];
  storages = ['64GB', '128GB', '256GB', '512GB'];

  selectedBrand = '';
  selectedRam = '';
  selectedStorage = '';
  searchText = '';
  loading = false;

  compareList: Product[] = [];

  selectedGroupCode: string | null = null;

  // Thêm các thuộc tính để sửa lỗi
  isLoggedIn: boolean = false; // Cần cập nhật theo logic đăng nhập thực tế
  currentProduct: Product | null = null; // Cần gán khi chọn sản phẩm
  quantity: number = 1; // Số lượng mặc định

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
    this.loadSearchFilters();
    this.loadPhones();
  }

  loadPhones(): void {
    this.loading = true;
    // Assuming category 2 is for phones
    this.productService.getProductsByCategoryId(2).subscribe({
      next: (data) => {
        console.log("Raw data from API:", data); // Log dữ liệu thô
        this.allPhones = data;
        this.applyFiltersAndGrouping();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading phones:', error);
        this.toastr.error('Không thể tải danh sách điện thoại');
        this.loading = false;
      }
    });
  }

  loadSearchFilters(): void {
    // Đọc dữ liệu tìm kiếm từ sessionStorage
    const searchData = sessionStorage.getItem('searchFormData');
    if (searchData) {
      try {
        const filters = JSON.parse(searchData);
        console.log('Loaded search filters:', filters);

        // Áp dụng các filter từ homepage
        if (filters.brand) {
          this.selectedBrand = filters.brand;
        }
        if (filters.search) {
          this.searchText = filters.search;
        }

        // Lưu price range để sử dụng trong filter
        this.minPrice = filters.minPrice || 0;
        this.maxPrice = filters.maxPrice || 0;

        // Xóa dữ liệu tìm kiếm khỏi sessionStorage sau khi đã sử dụng
        sessionStorage.removeItem('searchFormData');
      } catch (error) {
        console.error('Error parsing search data:', error);
      }
    }
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
    // 1. Filter the flat list first
    const filtered = this.allPhones.filter(phone => {
      const brandMatch = !this.selectedBrand || (phone.brand && phone.brand.toLowerCase().includes(this.selectedBrand.toLowerCase()));
      const parsedRam = this.parseRam(phone.productName);
      const ramMatch = !this.selectedRam || (parsedRam !== null && parsedRam.toLowerCase().includes(this.selectedRam.toLowerCase()));
      const parsedStorage = this.parseStorage(phone.productName);
      const storageMatch = !this.selectedStorage || (parsedStorage !== null && parsedStorage.toLowerCase().includes(this.selectedStorage.toLowerCase()));
      const searchMatch = !this.searchText || phone.productName.toLowerCase().includes(this.searchText.toLowerCase());

      // Thêm price filter
      const priceMatch = !this.minPrice && !this.maxPrice ||
                        (phone.price >= this.minPrice && phone.price <= this.maxPrice);

      return brandMatch && ramMatch && storageMatch && searchMatch && priceMatch;
    });

    // 2. Group the filtered list
    const grouped = new Map<string, Product[]>();
    filtered.forEach(phone => {
      const groupKey = phone.groupCode || `product-${phone.id}`; // Use groupCode or fallback to unique ID
      const group = grouped.get(groupKey);
      if (group) {
        group.push(phone);
      } else {
        grouped.set(groupKey, [phone]);
      }
    });

    // 3. Create display models from the groups
    this.displayProducts = Array.from(grouped.values()).map(group => {
      const representative = group[0];
      const prices = group.map(p => p.price).filter(p => typeof p === 'number'); // Lọc ra các giá trị là số
      console.log('GroupCode:', representative.groupCode, 'Prices array:', prices); // Log mảng giá
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0; // Xử lý khi mảng rỗng
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0; // Xử lý khi mảng rỗng

      // Lấy thuộc tính nổi bật từ phiên bản đại diện
      const colorAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'color');
      const storageAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'storage');
      const ramAttr = representative.attributes?.find(a => a.name.toLowerCase() === 'ram');

      // Tổng hợp số lượng tồn kho của cả nhóm
      const totalStock = group.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

      // Lấy mô tả ngắn nếu có
      const shortDescription = representative.description ? representative.description.split('.').slice(0,1).join('.') : '';

      // Attempt to get a cleaner base name, used as a fallback
      const baseName = representative.productName.split('-')[0].trim();

      const displayProduct = {
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
      console.log('GroupCode:', displayProduct.groupCode, 'minPrice:', minPrice, 'maxPrice:', maxPrice);
      return displayProduct;
    });
  }

  onFilterChange(): void {
    this.applyFiltersAndGrouping();
  }

  addToCompare(phone: Product): void {
    if (!this.compareList.find(p => p.id === phone.id) && this.compareList.length < 3) {
      this.compareList.push(phone);
    }
  }

  removeFromCompare(phone: Product): void {
    this.compareList = this.compareList.filter(p => p.id !== phone.id);
  }

  clearCompare(): void {
    this.compareList = [];
  }

  isInCompareList(phone: Product): boolean {
    return this.compareList.some(p => p.id === phone.id);
  }

  getRatingValue(phone: Product): number {
    const ratingAttribute = phone.attributes?.find(a => a.name === 'Rating');
    const ratingValue = ratingAttribute ? parseFloat(ratingAttribute.value) : 0;
    return isNaN(ratingValue) ? 0 : ratingValue;
  }

  getAttributeValue(phone: Product, attributeName: string): string {
    const attr = phone.attributes?.find(a => a.name === attributeName);
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
      this.onCloseModal(); // Close modal after navigating
    }
  }

  getCartId(userId: number): void {
    this.cartService.getCart(userId).subscribe({
      next: cart => {
        console.log('cart object:', cart);
        this.cartId = cart.cartId || cart.id;
        console.log('cartId:', this.cartId);
      },
      error: (error) => {
        console.error('Error getting cart ID:', error);
        this.toastr.error('Không thể lấy ID giỏ hàng');
      }
    });
  }

  addToCart(product: any, quantity: number = 1): void {
    // Kiểm tra đăng nhập
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

    // Sử dụng method addToCart với đúng signature
    this.cartService.addToCart(user.id, product.representativeId, quantity).subscribe({
      next: (response) => {
        console.log('Added to cart:', response);
        this.toastr.success('Đã thêm sản phẩm vào giỏ hàng');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.toastr.error('Không thể thêm sản phẩm vào giỏ hàng');
      }
    });
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image || image.trim() === '') return '';
    if (image.startsWith('/9j/')) return 'data:image/jpeg;base64,' + image; // base64 JPEG
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return 'http://localhost:8080' + image;
    return image;
  }

  buyNow(product: any): void {
    // Kiểm tra đăng nhập
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

    // Tạo checkout item từ product group
    const checkoutItem = {
      id: product.representativeId,
      name: product.name,
      image: this.getImageUrl(product.image),
      quantity: 1,
      price: product.minPrice, // Sử dụng giá thấp nhất
      selected: true
    };

    console.log('Buy now item:', checkoutItem);

    // Chuyển đến trang checkout với sản phẩm được chọn
    this.router.navigate(['/checkout'], {
      state: { selectedItems: [checkoutItem] }
    });
  }
}
