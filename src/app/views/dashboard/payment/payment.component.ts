import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../_services/booking.service'; 
import { FieldService } from 'src/app/_services/field.service';
import { PaymentService } from '../../../_services/payment.service';

interface BookingDetails {
  bookingId: number;
  nameGuest: string;
  phoneNumberGuest: string;
  day: Date;
  timeStart: string;
  timeEnd: string;
  totalPayment: string;
  fieldId: number;
  nameField: string;
  smallFieldName: string;
}

interface FieldDetails {
  fieldId: number;
  fieldName: string;
  address: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  bookingDetails: BookingDetails | undefined;
  fieldDetails: FieldDetails | undefined;
  countdownMinutes: number = 5;
  countdownSeconds: number = 0;
  countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private fieldService: FieldService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (bookingId) {
      this.getBookingDetails(+bookingId);
      this.startCountdown(); // Bắt đầu đếm ngược
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Xoá interval khi component bị huỷ
    }
  }

  getBookingDetails(bookingId: number): void {
    this.bookingService.getBookingbyId(bookingId).subscribe(
      (data: BookingDetails) => {
        this.bookingDetails = data;
        if (data && data.fieldId) {
          this.getFieldDetails(data.fieldId);
        }
      },
      (error: any) => {
        console.error('Error fetching booking details:', error);
      }
    );
  }

  getFieldDetails(fieldId: number): void {
    this.fieldService.findByIdField(fieldId).subscribe(
      (data: FieldDetails) => {
        this.fieldDetails = data;
      },
      (error: any) => {
        console.error('Error fetching field details:', error);
      }
    );
  }
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.countdownSeconds === 0) {
        if (this.countdownMinutes > 0) {
          this.countdownMinutes--;
          this.countdownSeconds = 59;
        } else {
          this.timeUp();
          this.stopCountdown();
        }
      } else {
        this.countdownSeconds--;
      }
    }, 1000);
  }
  
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
  

  timeUp(): void {
    if (this.bookingDetails) {
      this.deleteBooking(this.bookingDetails.bookingId);
      alert('Thời gian đã hết! Thông tin đặt sân của bạn đã bị xóa.');
      this.router.navigate(['/']);
    }
  }

  deleteBooking(bookingId: number): void {
    this.bookingService.deleteBooking(bookingId).subscribe(
      () => {
        console.log('Booking successfully deleted.');
      },
      (error: any) => {
        console.error('Error deleting booking:', error);
      }
    );
  }
  

  payWithMomo(): void {
    if (this.bookingDetails) {
      console.log('Initiating payment with MoMo for booking ID:', this.bookingDetails.bookingId);
      // Gọi service hoặc API thanh toán tại đây
    }
  }

  payWithBank(): void {
    console.log('Booking Details:', this.bookingDetails);

    // Kiểm tra thông tin đặt sân và tổng số tiền có tồn tại hay không
    if (this.bookingDetails && this.bookingDetails.bookingId && this.bookingDetails.totalPayment) {
      console.log('Booking ID:', this.bookingDetails.bookingId);
      console.log('Total Payment (before conversion):', this.bookingDetails.totalPayment);

      // Loại bỏ dấu phẩy và khoảng trắng nếu có trong số tiền
      const amount = parseFloat(this.bookingDetails.totalPayment.replace(/,/g, '').replace(/ /g, ''));
      console.log('Total Payment (after conversion):', amount);

      // Gọi service để tạo thanh toán
      this.paymentService.createPayment(this.bookingDetails.bookingId, amount)
        .subscribe(
          (paymentUrl: string) => {
            if (paymentUrl && paymentUrl.trim() !== '') {
              console.log('Payment URL:', paymentUrl);

              // Chuyển hướng tới URL thanh toán nhận được từ backend
              window.location.href = paymentUrl;
            } else {
              console.error('Received empty or invalid payment URL');
              alert('Đã xảy ra lỗi khi tạo URL thanh toán. Vui lòng thử lại sau.');
            }
          },
          (error: any) => {
            console.error('Error creating payment URL:', error);
            alert('Đã xảy ra lỗi khi tạo URL thanh toán. Vui lòng thử lại sau.');
          }
        );
    } else {
      console.error('Booking details or total payment is missing.');
      alert('Thông tin đặt sân hoặc tổng số tiền không hợp lệ. Vui lòng kiểm tra lại.');
    }
  }
}
