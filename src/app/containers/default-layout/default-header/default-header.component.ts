import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { UserChangePassComponent } from '../../../views/system/user/user-change-pass/user-change-pass.component';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../_services/notification.service';
import { Subscription } from 'rxjs';
import { PaymentService } from 'src/app/_services/payment.service';
import { tblNotification } from 'src/app/model/tblNotification';
import { SupplierService } from 'src/app/_services/supplier.service';
import { CartService } from '../../../_services/cart.service';
import { ProductService } from '../../../_services/product.service';
import { OrderService } from '../../../_services/order.service';
import { forkJoin } from 'rxjs';
// Import SidebarService nếu cần, bỏ comment nếu bạn sử dụng
// import { SidebarService } from '../../../_services/sidebar.service';

interface CartItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderItem {
  id?: number; // Thay đổi từ number thành number | undefined
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id?: number; // Thay đổi từ number thành number | undefined
  userId: number;
  totalAmount: number;
  status: number;
  shippingAddress: string;
  phone: string;
  email: string;
  orderDate: Date;
  items?: OrderItem[];
}

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss']
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  @Input() sidebarId: string = 'sidebar';
  notifications: { id: number; message: string; time: string; }[] = [];
  cartItems: CartItem[] = []; // Thêm mảng cartItems
  successfulOrders: Order[] = []; // Danh sách đơn hàng thành công
  successfulOrderCount = 0; // Số lượng đơn hàng thành công

  isLoggedIn = false;
  isUserRole = false;
  cartItemCount = 0; // Số lượng sản phẩm trong giỏ hàng
  private notificationSubscription: Subscription | null = null;
  private cartChangedSub: Subscription | null = null;
  urlAvatar: any;
  isAvatar = false;
  isAvatarDefault = false;

  constructor(
    private router: Router,
    private classToggler: ClassToggleService,
    private notificationService: NotificationService,
    private tokenStorage: TokenStorageService,
    public dialog: MatDialog,
    private paymentService: PaymentService,
    private supplierService: SupplierService,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    // private sidebarService: SidebarService // Bỏ comment nếu sử dụng
  ) {
    super();
  }

  /**
   * Navigate to the homepage
   */
  navigateToHome(): void {
    this.router.navigate(['/homepage']);
  }

  ngOnInit(): void {
    const user: any = this.tokenStorage.getUser();
    this.isLoggedIn = !!user && !!user.id;

    if (this.isLoggedIn) {
        this.isUserRole = user.roleId === 4 || user.groupRoleId === 4;
        this.getCartItems();

        this.urlAvatar = this.tokenStorage.getAvartarByUser();
        this.isAvatar = !!this.urlAvatar;
        this.isAvatarDefault = !this.urlAvatar;

        this.supplierService.getSupplierBySupplierNameLogin(user.username).subscribe(
            (supplier) => {
                console.log('Thông tin Supplier:', supplier);
                if (supplier && supplier.fieldId) {
                    const fieldIdArray = supplier.fieldId.split(',').map(Number);

                    fieldIdArray.forEach(fieldId => {
                        console.log(`Kiểu dữ liệu của fieldId ${fieldId}:`, typeof fieldId);
                        if (isNaN(fieldId)) {
                            console.error(`fieldId ${fieldId} không phải là một số hợp lệ`);
                        } else {
                            console.log(`fieldId ${fieldId} là số hợp lệ`);
                        }

                        this.paymentService.getNotification(fieldId).subscribe(
                          (data: any) => {
                              console.log(`Thông báo từ cơ sở dữ liệu cho fieldId ${fieldId}:`, data);

                              if (Array.isArray(data)) {
                                this.notifications.push(...data.map(notification => ({
                                  id: notification.id || 0,
                                  message: notification.message || '',
                                  time: this.convertToDate(notification.time)?.toISOString() || '' // Chuyển Date thành string
                              })));


                                  // Sắp xếp thông báo theo ID từ lớn đến bé
                                  this.notifications.sort((a, b) => b.id - a.id);
                              } else {
                                  console.error(`Dữ liệu trả về không phải là mảng:`, data);
                              }
                          },
                          (error) => {
                              console.error(`Lỗi khi lấy thông báo từ cơ sở dữ liệu cho fieldId ${fieldId}:`, error);
                          }
                      );

                    });

                } else {
                    console.warn('Không tìm thấy fieldId trong thông tin supplier.');
                }
            },
            (error) => {
                console.error('Lỗi khi lấy thông tin supplier:', error);
            }
        );
    }

    // Lắng nghe thông báo mới
    this.notificationSubscription = this.notificationService.connect().subscribe(
        (notification: string) => {
            console.log('Nhận thông báo:', notification);
            // Giả định thông báo mới cũng có id và được đẩy vào mảng
            this.notifications.push({ id: Date.now(), message: notification, time: new Date().toISOString() });
            this.notifications.sort((a, b) => b.id - a.id); // Sắp xếp sau khi nhận thông báo mới
        },
        (error) => {
            console.error('Lỗi khi nhận thông báo:', error);
        }
    );

    // Lấy số lượng sản phẩm trong giỏ hàng (cần implement service giỏ hàng)
    this.getCartItemCount();

    if (this.isLoggedIn) {
      // Lắng nghe sự thay đổi giỏ hàng
      this.cartChangedSub = this.cartService.cartChanged$.subscribe(() => {
        this.getCartItems();
      });

      // Lấy đơn hàng thành công
      this.getSuccessfulOrders();
    }
  }

  getCartItemCount(): void {
    // Lấy số lượng sản phẩm từ mảng cartItems
    this.cartItemCount = this.cartItems.length;
  }

  getCartItems(): void {
    const user = this.tokenStorage.getUser();
    if (!user?.id) {
      this.cartItems = [];
      this.cartItemCount = 0;
      return;
    }
    this.cartService.getCart(user.id).subscribe({
      next: cart => {
        const cartId = cart.cartId || cart.id; // tuỳ backend trả về
        if (!cartId) {
          this.cartItems = [];
          this.cartItemCount = 0;
          return;
        }
        this.cartService.getCartItems(cartId).subscribe({
          next: items => {
            // Gọi ProductService cho từng productId
            const productRequests = items.map(item => this.productService.getProductById(item.productId));
            forkJoin(productRequests).subscribe(products => {
              this.cartItems = items.map((item: any, idx) => ({
                id: item.cartItemId,
                name: products[idx]?.productName || 'Sản phẩm',
                image: products[idx]?.image ? 'data:image/jpeg;base64,' + products[idx].image : 'default.jpg',
                quantity: item.quantity,
                price: item.price || products[idx]?.price
              }));
              this.getCartItemCount();
            });
          },
          error: () => {
            this.cartItems = [];
            this.cartItemCount = 0;
          }
        });
      },
      error: () => {
        this.cartItems = [];
        this.cartItemCount = 0;
      }
    });
  }

  convertToDate(time: any): Date | null {
    if (!time) return null; // Nếu time bị null, trả về null

    if (time instanceof Date) {
        return time; // Nếu đã là Date, giữ nguyên
    }

    if (typeof time === 'string') {
        // Kiểm tra xem chuỗi có đúng định dạng DD/MM/YYYY không
        const parts = time.split(/[/ :]/);
        if (parts.length < 6) return null;

        const [day, month, year, hours, minutes, seconds] = parts.map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    if (typeof time === 'number') {
        return new Date(time); // Nếu là timestamp, chuyển thành Date
    }

    return null; // Nếu không nhận diện được, trả về null
  }

  logOut(): void {
    this.tokenStorage.signOut();
    this.isLoggedIn = false;
    this.isUserRole = false;
    this.cartItemCount = 0;
    this.router.navigate(['/login']);
  }

  changePassword(): void {
    const data = {
      userId: this.tokenStorage.getUser().id,
      isAdminReset: false,
    };
    const dialogRef = this.dialog.open(UserChangePassComponent, {
      data: data,
      width: '50%',
    });
  }

  // Lấy đơn hàng thành công của user
  getSuccessfulOrders(): void {
    const user = this.tokenStorage.getUser();
    if (!user?.id) {
      this.successfulOrders = [];
      this.successfulOrderCount = 0;
      return;
    }

    // Lấy đơn hàng có status = 1 (đã xác nhận/thanh toán thành công)
    this.orderService.getOrdersByUserAndStatus(user.id, 1).subscribe({
      next: (orders) => {
        this.successfulOrders = orders.map((order: any) => ({
          ...order,
          orderDate: this.convertToDate(order.orderDate)
        }));
        this.successfulOrderCount = orders.length;
      },
      error: (error) => {
        console.error('Lỗi lấy đơn hàng thành công:', error);
        this.successfulOrders = [];
        this.successfulOrderCount = 0;
      }
    });
  }

  // Xem chi tiết đơn hàng
  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders'], {
      queryParams: { orderId }
    });
  }

  // Ví dụ phương thức toggleSidebar, giữ lại nếu cần
  // toggleSidebar(): void {
  //   this.sidebarService.toggleSidebar();
  // }
}
