import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../_services/token-storage.service';
import { CartService } from '../../_services/cart.service';
import { ProductService } from '../../_services/product.service';

interface CartItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  isLoggedIn = false;
  userId: number | null = null;
  selectAll: boolean = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    console.log('CartComponent ngOnInit called');
    this.isLoggedIn = !!this.tokenStorage.getUser();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.tokenStorage.getUser();
    this.userId = user?.id || null;
    if (this.userId) {
      this.loadCartItemsFromBackend(this.userId);
    }
  }

  loadCartItemsFromBackend(userId: number): void {
    this.cartService.getCart(userId).subscribe({
      next: cart => {
        const cartId = cart.cartId || cart.id;
        if (!cartId) {
          this.cartItems = [];
          this.totalAmount = 0;
          this.selectAll = false;
          return;
        }
        this.cartService.getCartItems(cartId).subscribe({
          next: items => {
            // Gọi ProductService cho từng productId để lấy thông tin sản phẩm
            const productRequests = items.map(item => this.productService.getProductById(item.productId));
            Promise.all(productRequests.map(req => req.toPromise())).then(products => {
              this.cartItems = items.map((item: any, idx: number) => {
                const product = products[idx];
                return {
                  id: item.productId, // Sửa lại thành productId
                  name: product?.productName || 'Sản phẩm',
                  image: product && product.image ? 'data:image/jpeg;base64,' + product.image : 'default.jpg',
                  quantity: item.quantity,
                  price: item.price || product?.price || 0,
                  selected: true // Mặc định chọn tất cả
                };
              });
              this.selectAll = true; // Mặc định chọn tất cả
              console.log('Cart items loaded:', this.cartItems);
              this.calculateTotal();
            });
          },
          error: () => {
            this.cartItems = [];
            this.totalAmount = 0;
            this.selectAll = false;
          }
        });
      },
      error: () => {
        this.cartItems = [];
        this.totalAmount = 0;
        this.selectAll = false;
      }
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getSelectedTotal(): number {
    return this.cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getSelectedCount(): number {
    return this.cartItems.filter(item => item.selected).length;
  }

  isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    console.log('Toggle select all:', checked);
    this.selectAll = checked;
    this.cartItems.forEach(item => {
      item.selected = checked;
    });
    console.log('Updated cart items:', this.cartItems);
  }

  onItemSelectionChange(): void {
    console.log('Item selection changed:', this.cartItems);
    // Cập nhật trạng thái selectAll
    this.selectAll = this.isAllSelected();
  }

  toggleItemSelection(index: number): void {
    console.log('Toggle item selection:', index);
    this.cartItems[index].selected = !this.cartItems[index].selected;
    this.selectAll = this.isAllSelected();
    console.log('Updated cart items:', this.cartItems);
  }

  saveCart(): void {
    // Đảm bảo id là productId khi lưu vào localStorage
    const itemsToSave = this.cartItems.map(item => ({
      ...item,
      id: (item as any).productId || item.id // fallback nếu đã có id đúng
    }));
    localStorage.setItem('cart', JSON.stringify(itemsToSave));
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      item.quantity = newQuantity;
      this.saveCart();
      this.calculateTotal();
      // TODO: Update quantity in backend if cần
    }
  }

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.saveCart();
    this.calculateTotal();
    // Cập nhật trạng thái selectAll
    this.selectAll = this.isAllSelected();
    // TODO: Remove item from backend nếu cần
  }

  proceedToCheckout(): void {
    const selectedItems = this.cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      // Có thể hiển thị thông báo
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    console.log('Proceeding to checkout with selected items:', selectedItems);

    // Chuyển đến trang checkout với dữ liệu selectedItems
    this.router.navigate(['/checkout'], {
      state: { selectedItems: selectedItems }
    });
  }

  // Test method để kiểm tra checkbox
  testCheckbox(): void {
    console.log('Test checkbox clicked');
    alert('Checkbox test clicked!');
  }
}
