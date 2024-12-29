import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../../../_services/booking.service'; // Import service để lấy dữ liệu booking
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-info',
  templateUrl: './booking-info.component.html',
  styleUrls: ['./booking-info.component.scss']
})
export class BookingInfoComponent implements OnInit {
  bookingForm: FormGroup;
  bookings: any[] = [];
  totalPages: number = 0;
  count: number = 0;
  fieldName: '';
  smallFieldName: '';
  guestName: '';
  phoneNumber: '';
  totalPayment: '';
  timeStart: '';
  timeEnd: '';
  day:  Date;
  statusField: '';
  status: '';
  form: any = {
    id: null,
    fieldName: '',
    smallFieldName:'',
    guestName: '',
    phoneNumber: '',
    totalPayment: '',
    timeStart: '',
    timeEnd: '',
    day: '',
    statusField: '',
  };
  currentIndex = -1;
  title = '';
  pageable: any = {
    pageNumber: 1,
    pageSize: 10
  };
  isLast = false;
  activePage = 4;
  page = 0;
 // count = 0;
 // totalPages = 0;
  pageSize = 3;
  pageSizes = [3, 6, 9];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.retrieveBookings(1);
  }

  // Tìm kiếm đơn đặt sân dựa trên thông tin trong form
  findBookings(): void {
    this.bookingService.getBooking(this.fieldName,this.smallFieldName,this.guestName, this.phoneNumber,this.totalPayment,this.timeStart,this.timeEnd,this.day,this.statusField,1, 10).subscribe({
        next:data => {
          this.bookings = data.content; 
          this.count = data.totalElements;
          this.pageable = data.pageable;
          this.totalPages = data.totalPages;
          this.pageSize = data.size;
          console.log(data);
        },
        error: err => {
        }
      });
    }

  // Hiển thị chi tiết của đơn đặt sân để chỉnh sửa
  editBooking(id: number): void {
    this.router.navigate(['/booking/edit', id]);
  }

  // Xóa đơn đặt sân
  deleteBooking(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đơn đặt sân này?')) {
      this.bookingService.deleteBooking(id).subscribe(
        () => {
          alert('Đơn đặt sân đã được xóa.');
        },
        (error: any) => {
          console.error('Lỗi khi xóa đơn đặt sân:', error);
        }
      );
    }
  }

 
  // Phương thức để lấy danh sách đơn đặt sân theo trang
  retrieveBookings(page: number): void {
    this.bookingService.getBooking(this.fieldName,this.smallFieldName,this.guestName, this.phoneNumber,this.totalPayment,this.timeStart,this.timeEnd,this.day,this.statusField,page, 10
    ).subscribe({
        next: data => {
          this.bookings = data.content;
          this.count = data.totalElements;
          this.pageable = data.pageable;
          this.totalPages = data.totalPages;
          this.pageSize = data.size;
          console.log(data);
      },
      error: err => {
      }
    });
  }
  
}
