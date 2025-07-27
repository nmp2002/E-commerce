import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService } from '../../_services/token-storage.service';
import { CartService } from '../../_services/cart.service';
import { PaymentService } from '../../_services/payment.service';
import { OrderService, Order, OrderItem, CreateOrderRequest, OrderResponse } from '../../_services/order.service';

interface CheckoutItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  selected: boolean;
}

interface CheckoutForm {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  note: string;
  paymentMethod: string;
}

interface District {
  value: string;
  label: string;
}



@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  selectedItems: CheckoutItem[] = [];
  totalAmount: number = 0;
  shippingFee: number = 0;
  isLoggedIn = false;
  userId: number | null = null;
  loading = false;
  availableDistricts: District[] = [];
  selectedPaymentMethod: string = 'cod';
  currentOrder: Order | null = null;



  paymentMethods = [
    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: 'cil-money' },
    { value: 'bank', label: 'Chuyển khoản ngân hàng', icon: 'cil-credit-card' },
    { value: 'vnpay', label: 'Thanh toán qua VNPay', icon: 'cil-bank' }
  ];

  // Danh sách tỉnh/thành phố và quận/huyện
  cityDistricts: { [key: string]: District[] } = {
    'hanoi': [
      { value: 'badinh', label: 'Quận Ba Đình' },
      { value: 'hoankiem', label: 'Quận Hoàn Kiếm' },
      { value: 'tayho', label: 'Quận Tây Hồ' },
      { value: 'longbien', label: 'Quận Long Biên' },
      { value: 'caugiay', label: 'Quận Cầu Giấy' },
      { value: 'dongda', label: 'Quận Đống Đa' },
      { value: 'haibatrung', label: 'Quận Hai Bà Trưng' },
      { value: 'hoangmai', label: 'Quận Hoàng Mai' },
      { value: 'thanhxuan', label: 'Quận Thanh Xuân' },
      { value: 'socson', label: 'Huyện Sóc Sơn' },
      { value: 'donganh', label: 'Huyện Đông Anh' },
      { value: 'gialam', label: 'Huyện Gia Lâm' },
      { value: 'namtu liem', label: 'Quận Nam Từ Liêm' },
      { value: 'thanhtri', label: 'Huyện Thanh Trì' },
      { value: 'me linh', label: 'Huyện Mê Linh' },
      { value: 'phuxuyen', label: 'Huyện Phú Xuyên' },
      { value: 'ung hoa', label: 'Huyện Ứng Hòa' },
      { value: 'thuong tin', label: 'Huyện Thường Tín' },
      { value: 'phu tho', label: 'Huyện Phú Thọ' },
      { value: 'quoc oai', label: 'Huyện Quốc Oai' },
      { value: 'thach that', label: 'Huyện Thạch Thất' },
      { value: 'chuong my', label: 'Huyện Chương Mỹ' },
      { value: 'thanh oai', label: 'Huyện Thanh Oai' },
      { value: 'thuong tin', label: 'Huyện Thường Tín' },
      { value: 'phu xuyen', label: 'Huyện Phú Xuyên' },
      { value: 'ung hoa', label: 'Huyện Ứng Hòa' },
      { value: 'my duc', label: 'Huyện Mỹ Đức' }
    ],
    'hcm': [
      { value: 'district1', label: 'Quận 1' },
      { value: 'district2', label: 'Quận 2' },
      { value: 'district3', label: 'Quận 3' },
      { value: 'district4', label: 'Quận 4' },
      { value: 'district5', label: 'Quận 5' },
      { value: 'district6', label: 'Quận 6' },
      { value: 'district7', label: 'Quận 7' },
      { value: 'district8', label: 'Quận 8' },
      { value: 'district9', label: 'Quận 9' },
      { value: 'district10', label: 'Quận 10' },
      { value: 'district11', label: 'Quận 11' },
      { value: 'district12', label: 'Quận 12' },
      { value: 'binhthanh', label: 'Quận Bình Thạnh' },
      { value: 'binhtan', label: 'Quận Bình Tân' },
      { value: 'govap', label: 'Quận Gò Vấp' },
      { value: 'phunhuan', label: 'Quận Phú Nhuận' },
      { value: 'tanbinh', label: 'Quận Tân Bình' },
      { value: 'tanphu', label: 'Quận Tân Phú' },
      { value: 'thuduc', label: 'Thành phố Thủ Đức' },
      { value: 'binhchanh', label: 'Huyện Bình Chánh' },
      { value: 'can gio', label: 'Huyện Cần Giờ' },
      { value: 'cu chi', label: 'Huyện Củ Chi' },
      { value: 'hoc mon', label: 'Huyện Hóc Môn' },
      { value: 'nha be', label: 'Huyện Nhà Bè' }
    ],
    'danang': [
      { value: 'haichau', label: 'Quận Hải Châu' },
      { value: 'thanhkhe', label: 'Quận Thanh Khê' },
      { value: 'son tra', label: 'Quận Sơn Trà' },
      { value: 'ngu hanh son', label: 'Quận Ngũ Hành Sơn' },
      { value: 'lien chieu', label: 'Quận Liên Chiểu' },
      { value: 'cam le', label: 'Quận Cẩm Lệ' },
      { value: 'hoa vang', label: 'Huyện Hòa Vang' },
      { value: 'hoang sa', label: 'Huyện Hoàng Sa' }
    ],
    'haiphong': [
      { value: 'hong bang', label: 'Quận Hồng Bàng' },
      { value: 'ngo quyen', label: 'Quận Ngô Quyền' },
      { value: 'le chan', label: 'Quận Lê Chân' },
      { value: 'hai an', label: 'Quận Hải An' },
      { value: 'kien an', label: 'Quận Kiến An' },
      { value: 'do son', label: 'Quận Đồ Sơn' },
      { value: 'duong kinh', label: 'Quận Dương Kinh' },
      { value: 'thuy nguyen', label: 'Huyện Thủy Nguyên' },
      { value: 'an duong', label: 'Huyện An Dương' },
      { value: 'an lao', label: 'Huyện An Lão' },
      { value: 'kien thuy', label: 'Huyện Kiến Thụy' },
      { value: 'tien lang', label: 'Huyện Tiên Lãng' },
      { value: 'vinh bao', label: 'Huyện Vĩnh Bảo' },
      { value: 'cat hai', label: 'Huyện Cát Hải' },
      { value: 'bach long vi', label: 'Huyện Bạch Long Vĩ' }
    ],
    'cantho': [
      { value: 'ninh kieu', label: 'Quận Ninh Kiều' },
      { value: 'o mon', label: 'Quận Ô Môn' },
      { value: 'binh thuy', label: 'Quận Bình Thủy' },
      { value: 'cai rang', label: 'Quận Cái Răng' },
      { value: 'thot not', label: 'Quận Thốt Nốt' },
      { value: 'vinh thanh', label: 'Huyện Vĩnh Thạnh' },
      { value: 'co do', label: 'Huyện Cờ Đỏ' },
      { value: 'phong dien', label: 'Huyện Phong Điền' },
      { value: 'thoi lai', label: 'Huyện Thới Lai' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private cartService: CartService,
    private paymentService: PaymentService,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
      district: ['', [Validators.required]],
      note: [''],
      paymentMethod: ['cod', [Validators.required]]
    });

    // Lắng nghe sự thay đổi của city để cập nhật districts
    this.checkoutForm.get('city')?.valueChanges.subscribe(city => {
      this.onCityChange(city);
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorage.getUser();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.tokenStorage.getUser();
    this.userId = user?.id || null;

    // Kiểm tra xem có phải retry payment không
    const retry = this.route.snapshot.queryParams['retry'];
    const retryOrderId = this.route.snapshot.queryParams['orderId'];

    if (retry === 'true' && retryOrderId) {
      // Xử lý retry payment - lấy thông tin đơn hàng cũ
      this.handleRetryPayment(parseInt(retryOrderId));
      return;
    }

    // Lấy dữ liệu từ state (từ "Mua ngay")
    const state = history.state;
    if (state && state.selectedItems) {
      this.selectedItems = state.selectedItems;
      this.calculateTotal();
      console.log('Checkout with buy now items:', this.selectedItems);
    } else {
      // Fallback: lấy từ localStorage (từ giỏ hàng)
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cartItems = JSON.parse(cartData);
        this.selectedItems = cartItems
          .filter((item: any) => item.selected)
          .map((item: any) => ({
            ...item,
            id: item.id || item.productId // fallback nếu id chưa có
          }));
        this.calculateTotal();
        console.log('Checkout with cart items:', this.selectedItems);
      }
    }

    // Nếu không có sản phẩm nào được chọn, quay về giỏ hàng
    if (this.selectedItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Pre-fill form với thông tin user nếu có
    if (user) {
      this.checkoutForm.patchValue({
        fullname: user.fullname ||  '',
        email: user.email || '',
        phone: user.telephone || ''
      });
    }

    // Debug: Kiểm tra form control paymentMethod
    console.log('Payment methods:', this.paymentMethods);
    console.log('Initial payment method value:', this.checkoutForm.get('paymentMethod')?.value);

    // Lắng nghe sự thay đổi của payment method
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(value => {
      console.log('Payment method changed to:', value);
    });
  }

  onCityChange(city: string): void {
    if (city && this.cityDistricts[city]) {
      this.availableDistricts = this.cityDistricts[city];
      // Reset district selection
      this.checkoutForm.patchValue({ district: '' });
    } else {
      this.availableDistricts = [];
      this.checkoutForm.patchValue({ district: '' });
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getTotalWithShipping(): number {
    return this.totalAmount + this.shippingFee;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      this.loading = true;
      console.log('Checkout form submitted:', this.checkoutForm.value);
      console.log('Selected items:', this.selectedItems);
      console.log('Total amount:', this.getTotalWithShipping());

      // Kiểm tra xem có phải retry payment không
      const retry = this.route.snapshot.queryParams['retry'];
      const retryOrderId = this.route.snapshot.queryParams['orderId'];

      if (retry === 'true' && retryOrderId && this.currentOrder) {
        // Retry payment - tạo đơn hàng mới từ đơn hàng cũ
        this.createOrderFromRetry().then(orderId => {
          if (orderId) {
            const paymentMethod = this.checkoutForm.get('paymentMethod')?.value;

            if (paymentMethod === 'vnpay') {
              // Bước 2: Xử lý thanh toán VNPay
              this.processVNPayPayment(orderId);
            } else {
              // Bước 3: Xử lý thanh toán thông thường (COD hoặc chuyển khoản)
              this.processNormalPayment(orderId);
            }
          } else {
            this.loading = false;
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
          }
        }).catch(error => {
          console.error('Error creating order from retry:', error);
          this.loading = false;
          alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        });
      } else {
        // Tạo đơn hàng mới bình thường
        this.createOrder().then(orderId => {
          if (orderId) {
            const paymentMethod = this.checkoutForm.get('paymentMethod')?.value;

            if (paymentMethod === 'vnpay') {
              // Bước 2: Xử lý thanh toán VNPay
              this.processVNPayPayment(orderId);
            } else {
              // Bước 3: Xử lý thanh toán thông thường (COD hoặc chuyển khoản)
              this.processNormalPayment(orderId);
            }
          } else {
            this.loading = false;
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
          }
        }).catch(error => {
          console.error('Error creating order:', error);
          this.loading = false;
          alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createOrder(): Promise<number> {
    return new Promise((resolve, reject) => {
      // Tạo địa chỉ giao hàng từ form
      const address = this.checkoutForm.get('address')?.value;
      const city = this.checkoutForm.get('city')?.value;
      const district = this.checkoutForm.get('district')?.value;
      const note = this.checkoutForm.get('note')?.value || '';

      const shippingAddress = `${address}, ${district}, ${city}${note ? ', Ghi chú: ' + note : ''}`;

      const orderData: CreateOrderRequest = {
        userId: this.userId || 0,
        totalAmount: this.getTotalWithShipping(),
        shippingAddress: shippingAddress,
        phone: this.checkoutForm.get('phone')?.value,
        email: this.checkoutForm.get('email')?.value,
        orderItems: this.selectedItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Gọi API để tạo order và order items
      this.orderService.createOrder(orderData).subscribe(
        (response: OrderResponse) => {
          console.log('Order created successfully:', response);
          resolve(response.id);
        },
        (error) => {
          console.error('Error creating order:', error);
          reject(error);
        }
      );
    });
  }

  createOrderFromRetry(): Promise<number> {
    return new Promise((resolve, reject) => {
      // Tạo địa chỉ giao hàng từ form
      const address = this.checkoutForm.get('address')?.value;
      const city = this.checkoutForm.get('city')?.value;
      const district = this.checkoutForm.get('district')?.value;
      const note = this.checkoutForm.get('note')?.value || '';

      const shippingAddress = `${address}, ${district}, ${city}${note ? ', Ghi chú: ' + note : ''}`;

      const orderData: CreateOrderRequest = {
        userId: this.userId || 0,
        totalAmount: this.getTotalWithShipping(),
        shippingAddress: shippingAddress,
        phone: this.checkoutForm.get('phone')?.value,
        email: this.checkoutForm.get('email')?.value,
        orderItems: this.selectedItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Gọi API để tạo order và order items
      this.orderService.createOrder(orderData).subscribe(
        (response: OrderResponse) => {
          console.log('Order created from retry successfully:', response);
          resolve(response.id);
        },
        (error) => {
          console.error('Error creating order from retry:', error);
          reject(error);
        }
      );
    });
  }

    processVNPayPayment(orderId: number): void {
    const amount = this.getTotalWithShipping();

    // Gọi service để tạo payment URL
    this.paymentService.createPayment(orderId, amount).subscribe(
      (paymentUrl: string) => {
        if (paymentUrl && paymentUrl.trim() !== '') {
          console.log('VNPay Payment URL:', paymentUrl);

          // Lưu orderId vào sessionStorage để sử dụng khi return từ VNPay
          sessionStorage.setItem('pendingOrderId', orderId.toString());

          window.location.href = paymentUrl; // Chuyển hướng tới URL thanh toán VNPay
        } else {
          console.error('Received empty or invalid VNPay payment URL');
          this.loading = false;
          alert('Đã xảy ra lỗi khi tạo URL thanh toán VNPay. Vui lòng thử lại sau.');
        }
      },
      (error: any) => {
        console.error('Error creating VNPay payment URL:', error);
        this.loading = false;
        alert('Đã xảy ra lỗi khi tạo URL thanh toán VNPay. Vui lòng thử lại sau.');
      }
    );
  }

    processNormalPayment(orderId: number): void {
    // Xử lý thanh toán thông thường (COD hoặc chuyển khoản)
    setTimeout(() => {
      this.loading = false;

      // TODO: Cập nhật trạng thái đơn hàng
      // this.orderService.updateOrderStatus(orderId, 1).subscribe(...);

      // Chuyển đến trang xác nhận đơn hàng
      this.router.navigate(['/order-confirmation'], {
        state: {
          orderData: {
            orderId: orderId,
            items: this.selectedItems,
            total: this.getTotalWithShipping(),
            formData: this.checkoutForm.value,
            status: 'confirmed',
            paymentStatus: 'pending'
          }
        }
      });
    }, 2000);
  }

  markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Method để test việc chọn payment method
  testPaymentMethodSelection(method: string): void {
    console.log('Testing payment method selection:', method);
    this.checkoutForm.patchValue({ paymentMethod: method });
    console.log('Form value after patch:', this.checkoutForm.value);
  }

  // Method để handle payment method change
  onPaymentMethodChange(method: string): void {
    console.log('Payment method changed via radio button:', method);
    this.selectedPaymentMethod = method;
    this.checkoutForm.patchValue({ paymentMethod: method });
    console.log('Form value after change:', this.checkoutForm.value);
  }

  // Helper methods để kiểm tra validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'Trường này là bắt buộc';
      }
      if (field.errors['email']) {
        return 'Email không hợp lệ';
      }
      if (field.errors['minlength']) {
        return `Tối thiểu ${field.errors['minlength'].requiredLength} ký tự`;
      }
      if (field.errors['pattern']) {
        return 'Số điện thoại không hợp lệ';
      }
    }
    return '';
  }

  /**
   * Xử lý retry payment - lấy thông tin đơn hàng cũ và cho phép thanh toán lại
   */
  handleRetryPayment(orderId: number): void {
    console.log('Handling retry payment for order:', orderId);

    // Lấy thông tin đơn hàng từ backend
    this.orderService.getOrderById(orderId).subscribe(
      (order) => {
        if (order) {
          console.log('Retrieved order for retry:', order);

          // Kiểm tra trạng thái đơn hàng
          if (order.status === 4) { // Đã hủy - có thể thanh toán lại
            // Lấy thông tin order items
            this.orderService.getOrderItems(orderId).subscribe(
              (orderItems) => {
                                // Chuyển đổi order items thành checkout items
                this.selectedItems = orderItems.map(item => ({
                  id: item.productId,
                  name: `Sản phẩm #${item.productId}`,
                  image: '/assets/images/default-product.jpg',
                  quantity: item.quantity,
                  price: item.price,
                  selected: true
                }));

                this.calculateTotal();

                // Pre-fill form với thông tin đơn hàng cũ
                const user = this.tokenStorage.getUser();
                this.checkoutForm.patchValue({
                  fullname: user?.fullname || '',
                  email: order.email || '',
                  phone: order.phone || '',
                  address: this.extractAddress(order.shippingAddress),
                  city: this.extractCity(order.shippingAddress),
                  district: this.extractDistrict(order.shippingAddress),
                  note: this.extractNote(order.shippingAddress)
                });

                // Trigger city change để load districts
                this.onCityChange(this.checkoutForm.get('city')?.value);

                // Lưu orderId để sử dụng khi tạo đơn hàng mới
                this.currentOrder = order;

                console.log('Retry payment setup completed');
              },
              (error) => {
                console.error('Error getting order items:', error);
                alert('Không thể lấy thông tin đơn hàng. Vui lòng thử lại.');
                this.router.navigate(['/orders']);
              }
            );
          } else {
            alert('Đơn hàng này không thể thanh toán lại.');
            this.router.navigate(['/orders']);
          }
        } else {
          alert('Không tìm thấy đơn hàng.');
          this.router.navigate(['/orders']);
        }
      },
      (error) => {
        console.error('Error getting order:', error);
        alert('Không thể lấy thông tin đơn hàng. Vui lòng thử lại.');
        this.router.navigate(['/orders']);
      }
    );
  }

  /**
   * Trích xuất địa chỉ từ shipping address string
   */
  private extractAddress(shippingAddress: string): string {
    if (!shippingAddress) return '';
    const parts = shippingAddress.split(',');
    return parts[0]?.trim() || '';
  }

  /**
   * Trích xuất thành phố từ shipping address string
   */
  private extractCity(shippingAddress: string): string {
    if (!shippingAddress) return '';
    const parts = shippingAddress.split(',');
    const cityPart = parts[2]?.trim();
    // Map tên thành phố về value
    for (const [key, districts] of Object.entries(this.cityDistricts)) {
      const cityName = districts[0]?.label?.split(',')[1]?.trim();
      if (cityName === cityPart) {
        return key;
      }
    }
    return '';
  }

  /**
   * Trích xuất quận/huyện từ shipping address string
   */
  private extractDistrict(shippingAddress: string): string {
    if (!shippingAddress) return '';
    const parts = shippingAddress.split(',');
    return parts[1]?.trim() || '';
  }

  /**
   * Trích xuất ghi chú từ shipping address string
   */
  private extractNote(shippingAddress: string): string {
    if (!shippingAddress) return '';
    const noteIndex = shippingAddress.indexOf('Ghi chú:');
    if (noteIndex !== -1) {
      return shippingAddress.substring(noteIndex + 8).trim();
    }
    return '';
  }
}
