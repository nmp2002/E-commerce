import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, Order, OrderItem } from '../../_services/order.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { ProductService } from '../../_services/product.service';

interface OrderItemWithName extends OrderItem {
  productName?: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  orderItems: OrderItem[] = [];
  loading = false;
  userId: number | null = null;

  constructor(
    private orderService: OrderService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    this.userId = user?.id || null;

    if (this.userId) {
      this.loadOrders();
    }

    // Nếu có orderId trên query param thì tự động mở modal chi tiết
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId && this.orders.length > 0) {
        const order = this.orders.find(o => o.id === +orderId);
        if (order) {
          this.viewOrderDetails(order);
        }
      }
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrdersByUser(this.userId!).subscribe(
      (orders) => {
        this.orders = orders;
        // Load order items cho từng order
        this.orders.forEach(order => {
          if (order.id) {
            this.orderService.getOrderItems(order.id).subscribe(
              (items) => {
                const itemsWithName: OrderItemWithName[] = items.map(item => ({ ...item }));
                itemsWithName.forEach(item => {
                  this.productService.getProductById(item.productId).subscribe(
                    (product) => {
                      item.productName = product?.productName || 'Sản phẩm';
                    },
                    () => {
                      item.productName = 'Sản phẩm';
                    }
                  );
                });
                (order as any).items = itemsWithName;
              },
              (error) => {
                (order as any).items = [];
              }
            );
          }
        });
        this.loading = false;
      },
      (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    );
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.loadOrderItems(order.id!);
  }

  loadOrderItems(orderId: number): void {
    this.orderService.getOrderItems(orderId).subscribe(
      (items) => {
        this.orderItems = items;
      },
      (error) => {
        console.error('Error loading order items:', error);
      }
    );
  }

  getStatusVietnamese(status: number | undefined): string {
    if (status === undefined) return 'Không xác định';
    return this.orderService.getStatusVietnamese(status);
  }

  getStatusClass(status: number | undefined): string {
    if (status === undefined) return 'badge bg-secondary';
    switch (status) {
      case 0: return 'badge bg-warning';
      case 1: return 'badge bg-info';
      case 2: return 'badge bg-primary';
      case 3: return 'badge bg-success';
      case 4: return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  cancelOrder(orderId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      this.orderService.cancelOrder(orderId).subscribe(
        (response) => {
          console.log('Order cancelled successfully:', response);
          this.loadOrders(); // Reload orders
        },
        (error) => {
          console.error('Error cancelling order:', error);
        }
      );
    }
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.orderItems = [];
  }

  getProductName(item: any): string {
    return item.productName || ('#' + item.productId);
  }
}
