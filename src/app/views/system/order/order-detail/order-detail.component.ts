import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartOrderService } from '../../../../_services/cart-order.service';
import { Order, OrderItem, OrderStatus } from '../../../../model/order.model';
import { ToastrService } from 'ngx-toastr';

interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  orderId: number = 0;
  order: Order | null = null;
  orderItems: OrderItem[] = [];
  statusHistory: OrderStatusHistory[] = [];
  loading = false;
  OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartOrderService: CartOrderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.orderId) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.cartOrderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loadOrderItems();
        this.loadStatusHistory();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải thông tin đơn hàng');
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  loadOrderItems(): void {
    if (!this.order) return;

    this.cartOrderService.getOrderItems(this.orderId).subscribe({
      next: (items) => {
        this.orderItems = items;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách sản phẩm');
        console.error('Error loading order items:', error);
      }
    });
  }

  loadStatusHistory(): void {
    if (!this.order) return;

    this.cartOrderService.getOrderStatusHistory(this.orderId).subscribe({
      next: (history) => {
        this.statusHistory = history;
      },
      error: (error) => {
        console.error('Error loading status history:', error);
      }
    });
  }

  updateOrderStatus(status: OrderStatus): void {
    if (!this.order) return;

    this.cartOrderService.updateOrderStatus(this.orderId, status).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công');
        this.loadOrderDetails();
      },
      error: (error) => {
        this.toastr.error('Không thể cập nhật trạng thái đơn hàng');
        console.error('Error updating order status:', error);
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'badge-warning';
      case OrderStatus.PROCESSING:
        return 'badge-info';
      case OrderStatus.SHIPPED:
        return 'badge-primary';
      case OrderStatus.DELIVERED:
        return 'badge-success';
      case OrderStatus.CANCELLED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xử lý';
      case OrderStatus.PROCESSING:
        return 'Đang xử lý';
      case OrderStatus.SHIPPED:
        return 'Đang giao hàng';
      case OrderStatus.DELIVERED:
        return 'Đã giao hàng';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  printOrder(): void {
    window.print();
  }
}
