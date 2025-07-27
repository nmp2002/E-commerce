import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../_services/payment.service';
import { OrderService } from '../../../_services/order.service';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {
  paymentStatus: string = '';
  orderId: string = '';
  loading = true;
  paymentMessage: string = '';
  orderStatus: string = '';
  orderDetails: any = null;
  orderItems: any[] = [];
  allSuccessfulOrders: any[] = [];
  currentUserId: number = 0;

  constructor(
    private route: ActivatedRoute,
    public paymentService: PaymentService,
    public orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lấy orderId từ sessionStorage (đã lưu khi chuyển hướng đến VNPay)
    this.orderId = sessionStorage.getItem('pendingOrderId') || '';

    // Lấy query parameters từ VNPay return
    const queryParams = this.route.snapshot.queryParams;

    if (this.orderId && Object.keys(queryParams).length > 0) {
      this.processPaymentResult(queryParams);
    } else {
      this.paymentStatus = 'error';
      this.paymentMessage = 'Dữ liệu thanh toán không hợp lệ';
      this.loading = false;
    }
  }

  processPaymentResult(vnpParams: any): void {
    console.log('Processing VNPay return parameters:', vnpParams);

    // Build params đúng format backend yêu cầu
    const backendParams = {
      vnp_TxnRef: vnpParams.orderId || this.orderId,
      vnp_ResponseCode: vnpParams.status === 'success' ? '00' : (vnpParams.status === 'failed' ? '01' : '99'),
      vnp_Amount: vnpParams.amount || '0'
    };

    this.paymentService.vnpayReturn(backendParams).subscribe(
      (response: string) => {
        console.log('Payment verification response:', response);

        if (response.includes('Payment success')) {
          // Thanh toán thành công - backend đã tự động cập nhật trạng thái
          this.paymentStatus = 'success';
          this.paymentMessage = 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.';
          this.orderStatus = 'Đã xác nhận (Đã thanh toán)';

          // Xóa orderId khỏi sessionStorage
          sessionStorage.removeItem('pendingOrderId');

          // Gọi API lấy chi tiết đơn hàng
          this.orderService.getOrderById(parseInt(this.orderId)).subscribe(
            (order) => {
              this.orderDetails = order;
            },
            (error) => {
              console.error('Lỗi lấy chi tiết đơn hàng:', error);
            }
          );

          // Gọi API lấy danh sách sản phẩm trong đơn hàng
          this.orderService.getOrderItems(parseInt(this.orderId)).subscribe(
            (items) => {
              this.orderItems = items;
            },
            (error) => {
              console.error('Lỗi lấy danh sách sản phẩm:', error);
            }
          );

          // Lấy user ID từ localStorage hoặc session (tùy vào cách lưu trữ)
          this.currentUserId = this.getCurrentUserId();

          // Gọi API lấy tất cả đơn hàng thành công của user
          if (this.currentUserId > 0) {
            this.orderService.getOrdersByUserAndStatus(this.currentUserId, 1).subscribe(
              (orders) => {
                this.allSuccessfulOrders = orders;
              },
              (error) => {
                console.error('Lỗi lấy danh sách đơn hàng thành công:', error);
              }
            );
          }

          // Không tự động chuyển hướng, giữ nguyên trang kết quả
          // Nếu muốn chuyển hướng, hãy bấm nút tương ứng
        } else if (response.includes('Payment failed')) {
          // Thanh toán thất bại - backend đã tự động hủy đơn hàng
          this.paymentStatus = 'failed';
          this.paymentMessage = 'Thanh toán thất bại. Đơn hàng đã được hủy.';
          this.orderStatus = 'Đã hủy';
        } else {
          // Trường hợp khác
          this.paymentStatus = 'unknown';
          this.paymentMessage = 'Không thể xác định trạng thái thanh toán.';
        }
        this.loading = false;
      },
      (error) => {
        console.error('Payment verification failed:', error);
        this.paymentStatus = 'error';
        this.paymentMessage = 'Có lỗi xảy ra khi xác minh thanh toán. Vui lòng liên hệ hỗ trợ.';
        this.loading = false;
      }
    );
  }

  // Kiểm tra trạng thái đơn hàng từ backend
  checkOrderStatus(): void {
    if (this.orderId) {
      const orderId = parseInt(this.orderId);
      this.paymentService.checkPaymentStatus(orderId).subscribe(
        (response) => {
          console.log('Order status check response:', response);
          this.orderStatus = response.message;
        },
        (error) => {
          console.error('Error checking order status:', error);
        }
      );
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  viewOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/orders'], {
        queryParams: { orderId: this.orderId }
      });
    }
  }

  retryPayment(): void {
    if (this.orderId) {
      // Chuyển về trang checkout để thử lại thanh toán
      this.router.navigate(['/checkout'], {
        queryParams: { retry: 'true', orderId: this.orderId }
      });
    }
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // Lấy user ID từ localStorage hoặc session storage
  getCurrentUserId(): number {
    // Thử lấy từ localStorage trước
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id || user.userId || 0;
      } catch (e) {
        console.error('Lỗi parse userInfo:', e);
      }
    }

    // Thử lấy từ sessionStorage
    const sessionUserInfo = sessionStorage.getItem('userInfo');
    if (sessionUserInfo) {
      try {
        const user = JSON.parse(sessionUserInfo);
        return user.id || user.userId || 0;
      } catch (e) {
        console.error('Lỗi parse session userInfo:', e);
      }
    }

    // Nếu không có, thử lấy từ orderDetails (nếu đã có)
    if (this.orderDetails && this.orderDetails.userId) {
      return this.orderDetails.userId;
    }

    return 0;
  }

  // Tính tổng tiền tất cả đơn hàng thành công
  getTotalAmount(): number {
    if (!this.allSuccessfulOrders || this.allSuccessfulOrders.length === 0) {
      return 0;
    }
    return this.allSuccessfulOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  }

  // Xem chi tiết đơn hàng
  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders'], {
      queryParams: { orderId: orderId }
    });
  }
}
