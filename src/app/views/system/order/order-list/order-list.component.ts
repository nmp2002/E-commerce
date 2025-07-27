import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CartOrderService } from '../../../../_services/cart-order.service';
import { Order, OrderStatus } from '../../../../model/order.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'customerName', 'orderDate', 'totalAmount', 'status', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  loading = false;
  OrderStatus = OrderStatus; // Make enum available to template

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private cartOrderService: CartOrderService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadOrders(): void {
    this.loading = true;
    this.cartOrderService.getAllOrders().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.toastr.error('Lỗi khi tải danh sách đơn hàng: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'badge-warning';
      case OrderStatus.CONFIRMED:
        return 'badge-info';
      case OrderStatus.PROCESSING:
        return 'badge-primary';
      case OrderStatus.SHIPPED:
        return 'badge-info';
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
        return 'Chờ xác nhận';
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
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

  viewOrderDetail(id: number): void {
    this.router.navigate(['/system/order/detail', id]);
  }

  editOrder(id: number): void {
    this.router.navigate(['/system/order/edit', id]);
  }

  deleteOrder(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      this.cartOrderService.deleteOrder(id).subscribe({
        next: () => {
          this.toastr.success('Xóa đơn hàng thành công');
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.toastr.error('Lỗi khi xóa đơn hàng: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
    }
  }

  updateOrderStatus(id: number, status: OrderStatus): void {
    this.cartOrderService.updateOrderStatus(id, status).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.toastr.error('Lỗi khi cập nhật trạng thái đơn hàng: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
