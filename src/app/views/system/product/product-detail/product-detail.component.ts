import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../../_services/product.service';
import { Product, ProductAttribute } from '../../../../model/product.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../_services/auth.service';
import { CartService } from '../../../../_services/cart.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { of, forkJoin } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { ProductAttributeService } from '../../../../_services/product-attribute.service';

// Interface to hold extracted variant options for display
interface VariantOption {
  value: string;
  productId: number;
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  currentProduct: Product | null = null;
  allVariants: Product[] = []; // All products in the same group

  // Options available for selection, e.g., "Color" -> [{value: "Red", productId: 1}, {value: "Blue", productId: 2}]
  variantOptions = new Map<string, VariantOption[]>();

  // The user's current selections, e.g., "Color" -> "Red"
  selectedOptions = new Map<string, string>();

  loading = true;
  isLoggedIn = false;
  cartId: number | null = null;
  quantity: number = 1; // Add quantity property

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService,
    private authService: AuthService,
    private cartService: CartService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    private location: Location,
    private productAttributeService: ProductAttributeService
  ) { }

  ngOnInit(): void {
    console.log('ProductDetailComponent initialized.');
    // Listen to route changes to reload data when user switches variants
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        console.log('ID from route params:', id);
        if (id) {
          return of(Number(id));
        }
        this.router.navigate(['/']); // Or some error page
        return of(null);
      })
    ).subscribe(id => {
    if (id) {
        this.loadProductDetails(id);
      } else {
        console.log('No ID found in route, navigating away.');
      }
    });

    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadCartInfo();
    }
  }

  loadCartInfo(): void {
    const user = this.tokenStorage.getUser();
    if (user?.id) {
      this.cartService.getCart(user.id).subscribe({
        next: cart => {
          this.cartId = cart.id;
          console.log('cartId:', this.cartId);
        },
        error: () => {
          this.toastr.error('Không thể lấy thông tin giỏ hàng.');
        }
      });
    }
  }

  loadProductDetails(productId: number): void {
    console.log(`Starting to load details for product ID: ${productId}`);
    this.loading = true;

    this.productService.getProductAndVariants(productId).pipe(
      catchError(error => {
        console.error('Error loading product details:', error);
        this.toastr.error('Đã xảy ra lỗi khi tải thông tin sản phẩm.');
        this.loading = false;
        return of({ mainProduct: null, variants: [] });
      }),
      switchMap(({ mainProduct, variants }) => {
        console.log('Raw product data received:', { mainProduct, variants });
        if (!mainProduct || variants.length === 0) {
          return of({ mainProduct: null, variants: [] }); // Pass empty data down
        }
        // Fetch attributes for all variants
        const attributeFetches = variants.map(variant =>
          this.productAttributeService.getByProductId(variant.id!).pipe(
            map((attributes: any[]) => {
              console.log(`Attributes for variant ${variant.id}:`, attributes);
              // Map backend model to frontend model and attach to variant
              variant.attributes = attributes.map(attr => ({
                name: attr.attributeName,
                value: attr.attributeValue
              }));
              console.log(`Mapped attributes for variant ${variant.id}:`, variant.attributes);
              return variant;
            }),
            catchError((error) => {
              console.error(`Error fetching attributes for variant ${variant.id}:`, error);
              variant.attributes = []; // Set empty attributes on error
              return of(variant);
            })
          )
        );
        return forkJoin(attributeFetches).pipe(
          map(updatedVariants => ({ mainProduct, variants: updatedVariants }))
        );
      })
    ).subscribe(({ mainProduct, variants }) => {
      console.log('Final subscription received data (with attributes):', { mainProduct, variants });

      if (mainProduct && variants && variants.length > 0) {
        this.allVariants = variants;
        this.currentProduct = this.allVariants.find(v => v.id === productId) || mainProduct;

        console.log("Current Product Details:", this.currentProduct);
        console.log("Product Attributes:", this.currentProduct?.attributes);
        console.log("Attributes length:", this.currentProduct?.attributes?.length);

        this.extractAndSetVariantOptions();
      } else {
        if (!this.loading) {
          this.toastr.error('Không tìm thấy thông tin sản phẩm.');
          this.router.navigate(['/']);
        }
      }

      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private extractAndSetVariantOptions(): void {
    const options = new Map<string, Map<string, number>>(); // e.g., "Color" -> {"Red" -> 1, "Blue" -> 2}

    this.allVariants.forEach(variant => {
      variant.attributes?.forEach(attr => {
        if (!options.has(attr.name)) {
          options.set(attr.name, new Map<string, number>());
        }
        options.get(attr.name)!.set(attr.value, variant.id!);
      });
    });

    this.variantOptions.clear();
    options.forEach((valueMap, name) => {
      const displayOptions: VariantOption[] = [];
      valueMap.forEach((productId, value) => {
        displayOptions.push({ value, productId });
      });
      // Sort options for consistent display order
      displayOptions.sort((a, b) => a.value.localeCompare(b.value));
      this.variantOptions.set(name, displayOptions);
    });

    this.selectedOptions.clear();
    this.currentProduct?.attributes?.forEach(attr => {
      this.selectedOptions.set(attr.name, attr.value);
    });
  }

  onOptionSelect(optionName: string, optionValue: string): void {
    const tempSelectedOptions = new Map(this.selectedOptions);
    tempSelectedOptions.set(optionName, optionValue);

    const targetVariant = this.allVariants.find(variant => {
      return Array.from(tempSelectedOptions.entries()).every(([name, value]) =>
        variant.attributes?.some(attr => attr.name === name && attr.value === value)
      );
    });

    if (targetVariant) {
        if (targetVariant.id !== this.currentProduct?.id) {
            this.router.navigate(['/product/detail', targetVariant.id]);
        }
    } else {
        // Handle case where combination doesn't exist, maybe find the closest match
        // For now, we can just update the selection and the router will handle the rest
        this.selectedOptions.set(optionName, optionValue);
  }
  }

  getOptionKeys(map: Map<any, any>): string[] {
    return Array.from(map.keys());
  }

  addToCart(): void {
    console.log('[addToCart] Starting...');
    console.log('[addToCart] isLoggedIn:', this.isLoggedIn);
    console.log('[addToCart] currentProduct:', this.currentProduct);
    console.log('[addToCart] quantity:', this.quantity);
    console.log('[addToCart] stockQuantity:', this.currentProduct?.stockQuantity);

    if (!this.isLoggedIn) {
      console.log('[addToCart] User not logged in');
      this.toastr.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.currentProduct) {
      console.log('[addToCart] No current product');
      return;
    }

    // Tự động điều chỉnh quantity nếu vượt quá stock
    const maxStock = this.currentProduct.stockQuantity || 0;
    if (maxStock === 0) {
      console.log('[addToCart] Stock is 0 or undefined, allowing anyway...');
      // Cho phép thêm vào giỏ hàng ngay cả khi stock = 0 hoặc undefined
    } else if (this.quantity > maxStock) {
      console.log('[addToCart] Quantity exceeds stock, adjusting...');
      this.quantity = maxStock;
      this.toastr.warning(`Đã điều chỉnh số lượng xuống ${maxStock} (tối đa có sẵn)`);
    }

    const user = this.tokenStorage.getUser();
    console.log('[addToCart] user:', user);
    if (!user?.id) {
      console.log('[addToCart] No user ID');
      this.toastr.error('Không thể lấy thông tin người dùng');
      return;
    }

    console.log('[addToCart] Calling API with:', {
      userId: user.id,
      productId: this.currentProduct.id,
      quantity: this.quantity
    });

    this.loading = true;
    this.cartService.addToCart(user.id, this.currentProduct.id!, this.quantity).subscribe({
      next: () => {
        console.log('[addToCart] Success');
        this.toastr.success('Đã thêm sản phẩm vào giỏ hàng');
        this.cartService.notifyCartChanged();
        this.loading = false;
      },
      error: (err) => {
        console.error('[addToCart] Error:', err);
        this.toastr.error(err.error?.message || 'Không thể thêm vào giỏ hàng');
        this.loading = false;
      }
    });
  }

  buyNow(): void {
    if (!this.isLoggedIn) {
      this.toastr.info('Vui lòng đăng nhập để mua hàng.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.currentProduct) return;

    const user = this.tokenStorage.getUser();
    if (!user?.id) {
      this.toastr.error('Không thể lấy thông tin người dùng');
      return;
    }

    this.loading = true;
    this.cartService.addToCart(user.id, this.currentProduct.id!, this.quantity).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không thể xử lý mua ngay');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/system/product/list']);
  }

  viewProduct(productId: number): void {
    if (productId) {
      this.router.navigate(['/product/detail', productId]);
    }
  }

  // Helper function to check if a string is a valid hex color
  isHexColor(str: string): boolean {
    if (!str) return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);
  }

  // Add quantity management methods
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  getVariantDisplayOptions(): string[] {
    const allowed = ['color', 'màu sắc', 'dung lượng', 'storage', 'ram'];
    return this.getOptionKeys(this.variantOptions).filter(optionName =>
      allowed.includes(optionName.toLowerCase())
    );
  }

  getImageSrc(image: string): string {
    if (!image) return '';
    if (image.startsWith('data:image')) return image;
    // Nếu là base64 nhưng chưa có prefix
    if (/^[A-Za-z0-9+/=]+$/.test(image.substring(0, 30))) {
      return 'data:image/jpeg;base64,' + image;
    }
    // Nếu là URL bình thường
    return image;
  }
}
