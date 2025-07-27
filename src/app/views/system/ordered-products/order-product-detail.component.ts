import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartOrderService } from '../../../_services/cart-order.service';
import { ProductService } from '../../../_services/product.service';
import { UserService } from '../../../_services/user.service';
import { Order, OrderStatus, OrderItem } from '../../../model/order.model';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-order-product-detail',
  templateUrl: './order-product-detail.component.html',
  styleUrls: ['./order-product-detail.component.scss']
})
export class OrderProductDetailComponent implements OnInit {
  orderId!: number;
  productId!: number;
  order?: Order;
  orderItem?: OrderItem;
  product?: any;
  user?: any;
  loading = false;
  OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private cartOrderService: CartOrderService,
    private productService: ProductService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
    if (this.orderId && this.productId) {
      this.loadOrderDetail();
    }
  }

  loadOrderDetail(): void {
    this.loading = true;

    // Load order details
    this.cartOrderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;

        // Load order items
        this.cartOrderService.getOrderItems(this.orderId).subscribe({
          next: (items) => {
            this.orderItem = items.find(i => i.productId === this.productId);

            if (this.orderItem) {
              // Load product and user details in parallel
              const productRequest = this.productService.getProductById(this.productId).pipe(
                catchError(error => {
                  console.error('Error fetching product:', error);
                  return of(null);
                })
              );

              const userRequest = this.userService.findById(order.userId).pipe(
                catchError(error => {
                  console.error('Error fetching user:', error);
                  return of(null);
                })
              );

              forkJoin([productRequest, userRequest]).subscribe({
                next: ([product, user]) => {
                  this.product = product;
                  this.user = user;
                  this.loading = false;
                },
                error: (error) => {
                  console.error('Error loading product/user details:', error);
                  this.loading = false;
                }
              });
            } else {
              this.loading = false;
            }
          },
          error: (err) => {
            this.toastr.error('Không thể tải chi tiết sản phẩm');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.toastr.error('Không thể tải thông tin đơn hàng');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'badge bg-warning';
      case 1: return 'badge bg-success';
      case 2: return 'badge bg-info';
      case 3: return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Chờ xử lý';
      case 1: return 'Đã xác nhận';
      case 2: return 'Đang giao';
      case 3: return 'Đã giao';
      default: return 'Không xác định';
    }
  }

  getTotalPrice(): number {
    return this.orderItem ? this.orderItem.price * this.orderItem.quantity : 0;
  }

  printDetails(): void {
    window.print();
  }

  canUpdateStatus(): boolean {
    return this.order?.status === 1; // Chỉ cho phép khi status = 1 (Đã xác nhận)
  }

  updateOrderStatus(): void {
    if (!this.order || this.order.status !== 1) {
      this.toastr.warning('Chỉ có thể cập nhật đơn hàng đã được xác nhận');
      return;
    }

    this.loading = true;
    // Gọi API để cập nhật status từ 1 lên 2 (Đang giao)
    this.cartOrderService.updateOrderStatus(this.order.id, 2).subscribe({
      next: (response) => {
        this.toastr.success('Cập nhật trạng thái thành công!');
        if (this.order) {
          this.order.status = 2; // Cập nhật local (number)
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Lỗi khi cập nhật trạng thái: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }
}
