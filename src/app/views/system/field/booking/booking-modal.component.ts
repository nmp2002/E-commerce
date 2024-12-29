import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TblBooking } from '../../../../model/tblBooking';
import { BookingService } from '../../../../../app/_services/booking.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-booking-modal',
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.scss']
})
export class BookingModalComponent {
  @Input() booking?: TblBooking; 
  @Output() formClosed = new EventEmitter<void>();

  constructor(private bookingService: BookingService) {}

  save() {
    if (this.booking) {
      // Lấy các giá trị từ đối tượng booking
      const { bookingId, fieldId, guestId, shiftFieldId, smallFieldId, nameField, smallFieldName, nameGuest, phoneNumberGuest, totalPayment, timeStart, day, timeEnd, statusField, paymentStatus, fieldType, createdDate, createdBy, modifiedDate, modifiedBy } = this.booking;

      // Gọi hàm saveOrUpdateBooking từ service để cập nhật
      this.bookingService.saveOrUpdateBooking(
        bookingId!,
        fieldId!,
        guestId!,
        shiftFieldId!,
        smallFieldId!,
        nameField!,
        smallFieldName!,
        nameGuest!,
        phoneNumberGuest!,
        totalPayment!,
        timeStart!,
        day!,
        timeEnd!,
        statusField!,
        paymentStatus!,
        fieldType!,
        createdDate!,
        createdBy!,
        modifiedDate!,
        modifiedBy!
      ).subscribe(response => {
        console.log('Booking được cập nhật thành công:', response);
        // Sau khi lưu thành công, đóng modal
        this.close();
      }, error => {
        console.error('Lỗi khi cập nhật booking:', error);
      });
    } else {
      console.error('Không có dữ liệu booking để lưu.');
    }
  }

  close() {
    this.formClosed.emit();
  }
}
