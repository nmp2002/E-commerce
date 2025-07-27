import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderData {
  items: OrderItem[];
  total: number;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    note: string;
    paymentMethod: string;
  };
  status?: number; // Thêm trạng thái đơn hàng
}

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  orderData: OrderData | null = null;
  orderNumber: string = '';
  statusLabel: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Lấy dữ liệu từ state
    const state = history.state;
    if (state && state.orderData) {
      this.orderData = state.orderData;
      if (this.orderData) {
        this.statusLabel = this.getStatusLabel(this.orderData.status);
      }
      this.generateOrderNumber();
    } else {
      // Nếu không có dữ liệu, quay về trang chủ
      this.router.navigate(['/homepage']);
    }
  }

  generateOrderNumber(): void {
    // Tạo số đơn hàng ngẫu nhiên
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }

  continueShopping(): void {
    this.router.navigate(['/category']);
  }

  viewOrders(): void {
    // Chuyển đến trang quản lý đơn hàng
    this.router.navigate(['/orders']);
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'bank':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví MoMo';
      default:
        return method;
    }
  }

  getStatusLabel(status?: number): string {
    switch (status) {
      case 1:
        return 'Đã thanh toán thành công';
      case 0:
        return 'Chờ thanh toán';
      default:
        return 'Không xác định';
    }
  }
}
