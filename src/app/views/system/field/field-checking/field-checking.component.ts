import { Component, Input, OnInit, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '../../../../_services/field.service';
import { ShiftFieldService } from '../../../../_services/shiftfield.service';
import { BookingService } from '../../../../_services/booking.service';
import { TblSmallField } from '../../../../model/tblSmallField';
import { TblShiftField } from '../../../../model/tblShiftField';
import { TblBooking } from '../../../../model/tblBooking';
import { TblField } from '../../../../model/tblField';
import { formatDate ,DatePipe ,} from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Notify } from 'notiflix';
interface ShiftFieldWithSelection extends TblShiftField {
  selected?: boolean;
  smallFieldName?: string; 
  smallFieldId?: number;   
  bookingId?: number;
}

@Component({
  selector: 'app-field-checking',
  templateUrl: './field-checking.component.html',
  styleUrls: ['./field-checking.component.scss'],
  providers: [DatePipe]
})
export class FieldCheckingComponent implements OnInit {
  bookingForm: FormGroup;
  @Input() fields: TblField[]  [];
  smallFields: TblSmallField[] = [];
  fieldId: number;
  provinceName: string;
  districtName: string;
  wardName: string;
  selectedDate: string;
  shiftFieldsMap: { [key: string]: ShiftFieldWithSelection[] } = {};
  bookings: TblBooking[] = [];
  minDate: string;
  bookingFormVisible: boolean = false;
  bookingName: string = '';
  bookingPhone: string = '';
  bookingEmail: string = '';
  bookingShiftInfo: string = '';
  submitted: boolean = false;
  selectedShiftFields: ShiftFieldWithSelection[] = [];
  currentTime: Date;
  currentBookingInfo: string | null = null;
  editFormVisible: boolean = false; // Biến này để kiểm soát hiển thị của form chỉnh sửa
  selectedSmallField: any = null; // Biến này lưu trữ thông tin sân nhỏ đang được chỉnh sửa
  selectedBooking?: TblBooking;
  filteredSmallFields: TblSmallField[] = [];
  selectedFieldType: string = '';

  constructor(
    private route: ActivatedRoute,
    private fieldService: FieldService,
    private shiftFieldService: ShiftFieldService,
    private bookingService: BookingService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.minDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.bookingForm = this.fb.group({
      bookingName: ['', Validators.required],
      bookingPhone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // Adjust pattern as needed
      bookingEmail: ['', [Validators.required, Validators.email]]
    });
    this.currentTime = new Date();
  }

  ngOnInit(): void {
      const storedFieldId =  sessionStorage.getItem('fieldId');
    const storedProvinceId =  sessionStorage.getItem('provinceid');
    const storedDistrictId =  sessionStorage.getItem('districtId');
    const storedWardId =  sessionStorage.getItem('wardId');

    if (storedFieldId && storedProvinceId && storedDistrictId && storedWardId) {
      this.fieldId = +storedFieldId;
      this.fieldService.getCityById(+storedProvinceId).subscribe((city: any) => {
        this.provinceName = city?.provinceName;
      });
      this.fieldService.getDistrictsByCityId(+storedProvinceId).subscribe((districts: any[]) => {
        const district = districts.find(d => d.districtId === +storedDistrictId);
        this.districtName = district?.districtName;
      });
      this.fieldService.getWardsByDistrictId(+storedDistrictId).subscribe((wards: any[]) => {
        const ward = wards.find(w => w.wardId === +storedWardId);
        this.wardName = ward?.wardName;
      });

      this.loadSmallFields();
      this.loadBookings();
    } else {
      console.error('Field ID or location data not found in session storage.');
    }
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
  }

  loadSmallFields(): void {
    this.fieldService.getSmallFieldsByFieldId(this.fieldId).subscribe(data => {
      this.smallFields = data.map(field => ({
        ...field,
        status: field.status !== undefined ? +field.status : 0
      }));
      this.loadShiftFields();
    });
    this.filteredSmallFields = this.smallFields;
  }

  loadShiftFields(): void {
    this.shiftFieldsMap = {}; // Khởi tạo lại bản đồ ca sân
    
    this.smallFields.forEach(smallField => {
      this.shiftFieldService.getShiftFieldsByFieldType(this.fieldId, smallField.fieldType || '').subscribe({
        next: (shiftFields: TblShiftField[]) => {
          const sortedShiftFields = shiftFields.sort((a, b) => {
            const aName = (a.shiftFieldName || '').toString();
            const bName = (b.shiftFieldName || '').toString();
            
            const numA = parseFloat(aName);
            const numB = parseFloat(bName);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            } else {
              return aName.localeCompare(bName);
            }
          });
          
          this.shiftFieldsMap[smallField.fieldType || ''] = sortedShiftFields.map(shiftField => ({
            ...shiftField,
            selected: false,
            smallFieldId: smallField.id 
          }));
        },
        error: (error) => {
          console.error('Error loading shift fields:', error);
        }
      });
    });
  }
  
  

  loadBookings(): void {
    this.bookings = [];
    this.smallFields.forEach(smallField => {
      if (smallField.id !== undefined) {
        this.bookingService.getBookingsBySmallFieldId(smallField.id).subscribe(data => {
          console.log('Bookings data:', data); 
          this.updateShiftSelection();
          if (Array.isArray(data)) {
            this.bookings = [...this.bookings, ...data];
          } else {
            console.error('Dữ liệu trả về không phải là mảng:', data);
         
            this.bookings = [...this.bookings];
          }
        }, error => {
          console.error(`Error loading bookings for small field ID ${smallField.id}:`, error);
        });
      } else {
        console.error('Small field ID is undefined:', smallField);
      }
    });
  }
  
  

  updateShiftSelection(): void {
    console.log('Updating shift selection'); 
    
    this.selectedShiftFields = this.selectedShiftFields.filter(sf =>
      !this.shiftFieldsMap[sf.fieldType || '']?.some(shiftField => shiftField.id === sf.id)
    );
    this.updateBookingShiftInfo();
    console.log('Updated selected shift fields:', this.selectedShiftFields); 
  }
  

  
  getStatusClass(shiftField: ShiftFieldWithSelection,smallFieldId: number = 0): string {
    const booking = this.bookings.find(booking =>
      booking.shiftFieldId === shiftField.id && 
      booking.smallFieldId === smallFieldId &&
      booking.timeStart === shiftField.timeStart &&
      booking.timeEnd === shiftField.timeEnd &&
      new Date(booking.day ?? '').toDateString() === new Date(this.selectedDate ?? '').toDateString()
    );

    if (!booking) {
      return 'default';
    }

    const statusField = booking.statusField;
    switch (statusField) {
      case 'booked':
        return 'booked-status';
      case 'pending':
        return 'pending-status';
      default:
        return 'default';
    }
  }

  isShiftInPast(shiftField: ShiftFieldWithSelection): boolean {
    const currentDateTime = new Date();
    const shiftStartTime = new Date(`${this.selectedDate}T${shiftField.timeStart}`);
  
    return shiftStartTime < currentDateTime;
  }
  
  showBookingForm(): void {
    this.bookingFormVisible = true;
  }

  hideBookingForm(): void {
    this.bookingFormVisible = false;
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    this.loadBookings(); 
    this.clearShiftSelection(); 
  }

  isWeekend(date: string): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }

  toggleShiftSelection(shiftField: ShiftFieldWithSelection, smallFieldId: number = 0): void {
    console.log('Toggling shift selection:', shiftField);
  
    // Kiểm tra trạng thái và cho phép chọn nếu không phải là 'booked' hoặc 'pending'
    const statusClass = this.getStatusClass(shiftField, smallFieldId);
    if (statusClass !== 'booked-status' && statusClass !== 'pending-status') {
      shiftField.selected = !shiftField.selected;
      
      if (shiftField.selected) {
        // Cập nhật smallFieldId và smallFieldName khi chọn
        shiftField.smallFieldId = smallFieldId;
        const smallField = this.smallFields.find(sf => sf.id === smallFieldId);
        if (smallField) {
          shiftField.smallFieldName = smallField.smallFieldName;
          this.selectedShiftFields.push(shiftField);
        }
      } else {
        // Xóa khỏi danh sách các ca sân đã chọn
        const index = this.selectedShiftFields.findIndex(sf => sf.id === shiftField.id && sf.smallFieldId === smallFieldId);
        if (index > -1) {
          this.selectedShiftFields.splice(index, 1);
        }
      }
      
      console.log('Selected shift fields:', this.selectedShiftFields);
      this.updateBookingShiftInfo();
    } else {
      console.log('Cannot select shift field with status:', statusClass);
    }
  }
  
  
  
  
  
  
  updateBookingShiftInfo(): void {
    const shiftDetails = this.selectedShiftFields.map(sf => {
      const amount = this.isWeekend(this.selectedDate) ? sf.amountWeekend : sf.amountWeekday;
      return `Ngày: ${new Date(this.selectedDate).toLocaleDateString()}, Ca sân: ${sf.timeStart} - ${sf.timeEnd}, Sân nhỏ: ${sf.smallFieldName || 'Chưa xác định'}, Tiền: ${amount} VND`;
    }).join('\n');
  
    const totalPayment = this.selectedShiftFields.reduce((sum, sf) => 
      sum + (this.isWeekend(this.selectedDate) ? Number(sf.amountWeekend) || 0 : Number(sf.amountWeekday) || 0), 0
    );
    this.bookingShiftInfo = `${shiftDetails}\nTổng tiền: ${totalPayment} VND`;
    console.log(this.bookingShiftInfo);
  }
  
  

  submitBooking(): void {
    this.submitted = true;
    if (this.selectedShiftFields.length > 0) {
      this.fieldService.findByIdField(this.fieldId).subscribe(field => {
        if (!field) {
          console.error('Field not found');
          return;
        }
  
        this.selectedShiftFields.forEach(shiftField => {
          // Tìm smallField dựa trên fieldType của shiftField
          const smallField = this.smallFields.find(sf => sf.fieldType === shiftField.fieldType);
          
          if (!smallField) {
            console.error('Small field not found for shift field:', shiftField);
            return;
          }
  
          const booking: TblBooking = {
            bookingId: 0, 
            fieldId: this.fieldId || 0,
            guestId: 0, 
            shiftFieldId: shiftField.id || 0,
          smallFieldId: shiftField.smallFieldId || 0, 
          nameField: field.fieldName,
          smallFieldName: shiftField.smallFieldName || '', 
            nameGuest: this.bookingName,
            phoneNumberGuest: this.bookingPhone,
            totalPayment: this.calculateTotalPayment(shiftField).toString(), 
            timeStart: shiftField.timeStart,
            day: new Date(this.selectedDate),
            timeEnd: shiftField.timeEnd,
            statusField: 'pending',
            paymentStatus: 'unpaid',
            fieldType: shiftField.fieldType || '',
            createdDate: new Date(),
            createdBy: 'admin',
            modifiedDate: new Date(),
            modifiedBy: 'admin'
          };
  
          // Lưu hoặc cập nhật booking
          this.bookingService.saveOrUpdateBooking(
            booking.bookingId || 0,
            booking.fieldId || 0,
            booking.guestId || 0,
            booking.shiftFieldId || 0,
            booking.smallFieldId || 0,
            booking.nameField || '',
            booking.smallFieldName || '',
            booking.nameGuest || '',
            booking.phoneNumberGuest || '',
            booking.totalPayment || '0',
            booking.timeStart || '',
            booking.day || new Date(),
            booking.timeEnd || '',
            booking.statusField || 'pending',
            booking.paymentStatus || 'unpaid',
            booking.fieldType || '',
            booking.createdDate || new Date(),
            booking.createdBy || 'admin',
            booking.modifiedDate || new Date(),
            booking.modifiedBy || 'admin'
          ).subscribe(() => {
            console.log('Booking saved:', booking);
          });
        });
  
        this.hideBookingForm();
      });
    } else {
      console.error('No shifts selected for booking.');
    }
  }
  

  calculateTotalPayment(shiftField?: ShiftFieldWithSelection): string {
    if (!shiftField) {
      return this.selectedShiftFields.reduce((total, shift) => {
        const amount = this.isWeekend(this.selectedDate) ? shift.amountWeekend : shift.amountWeekday;
        return total + (amount ? +amount : 0);
      }, 0).toString();
    } else {
      const amount = this.isWeekend(this.selectedDate) ? shiftField.amountWeekend : shiftField.amountWeekday;
      return (amount ? +amount : 0).toString();
    }
  }

  clearShiftSelection(): void {
    Object.values(this.shiftFieldsMap).forEach(shiftFields => {
      shiftFields.forEach(shiftField => {
        shiftField.selected = false;
      });
    });
    this.selectedShiftFields = [];
    this.updateBookingShiftInfo();
  }


  
  removeShift(index: number): void {
    this.selectedShiftFields.splice(index, 1);
    this.updateBookingShiftInfo();
    }
    
    lockField(smallField: any): void {
        Swal.fire({
          text: "Bạn có chắc chắn muốn khóa sân?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Quay lại'
        }).then((result) => {
          if (result.isConfirmed) {
            this.fieldService.lockField(smallField.id).subscribe({
              next: (data: any) => {
                console.log(data);
                Notify.success('Khóa sân thành công!', {
                  timeout: 3000,
                  success: {
                    childClassName: 'notiflix-notify-success',
                  }
                });
              
              },
              error: (err: { error: { message: any; }; }) => {
                Notify.failure(err.error.message || 'Khóa sân thất bại!', {
                  timeout: 3000,
                  failure: {
                    childClassName: 'notiflix-notify-failure',
                  }
                });
              }
            });
          }
        });
      }
      
      // Mở khóa sân
      unlockField(smallField: any): void {
        Swal.fire({
          text: "Bạn có chắc chắn muốn mở khóa sân?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Quay lại'
        }).then((result) => {
          if (result.isConfirmed) {
            this.fieldService.unlockField(smallField.id).subscribe({
              next: (data: any) => {
                console.log(data);
                Notify.success('Mở khóa sân thành công!', {
                  timeout: 3000,
                  success: {
                    childClassName: 'notiflix-notify-success',
                  }
                });
                
              },
              error: (err: { error: { message: any; }; }) => {
                Notify.failure(err.error.message || 'Mở khóa sân thất bại!', {
                  timeout: 3000,
                  failure: {
                    childClassName: 'notiflix-notify-failure',
                  }
                });
              }
            });
          }
        });
    }
  getFieldStatusAsNumber(status: string | undefined): number {
        return parseInt(status || '0', 10);
  }
  getBookingStatusForField(smallFieldId: number): string {
    const currentDate = this.datePipe.transform(this.currentTime, 'yyyy-MM-dd');
    const currentTime = this.datePipe.transform(this.currentTime, 'HH:mm:ss');
    
    if (!currentDate || !currentTime) {
      return 'Sẵn sàng'; // Default status if date or time can't be transformed
    }
  
    const matchingBooking = this.bookings.find(booking =>
      booking.smallFieldId === smallFieldId &&
      this.datePipe.transform(booking.day, 'yyyy-MM-dd') === currentDate &&
      currentTime >= (booking.timeStart || '') && currentTime <= (booking.timeEnd || '')
    );
  
    if (matchingBooking) {
      // Tạo chuỗi chứa thông tin của khách
      return `Tên người đặt: ${matchingBooking.nameGuest || 'N/A'}, Số điện thoại: ${matchingBooking.phoneNumberGuest || 'N/A'}`;
    }
  
    return 'Sẵn sàng';
  }
  
  
  
  isObject(value: any): value is { nameGuest: string; phoneNumberGuest: string } {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  editSmallField(smallFieldId: number): void {
    this.fieldService.getSmallFieldById(smallFieldId).subscribe(
      (data) => {
        this.selectedSmallField = data; // Lưu thông tin sân nhỏ vào selectedSmallField
        this.editFormVisible = true; // Hiển thị form chỉnh sửa
        console.log('Data:', data);
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin sân nhỏ:', error);
        console.log(smallFieldId);
        
      }
    );
  }

  cancelEdit() {
    // Hủy bỏ các thay đổi và ẩn form
    this.editFormVisible = false;
  }
  
  editBooking(bookingId: number | undefined, event: Event): void {
    if (bookingId === undefined) {
      console.error('Booking ID không xác định.');
      return;
    }

    console.log('Đang chỉnh sửa booking với ID:', bookingId);
    event.stopPropagation(); // Ngăn chặn sự kiện click khác

    this.bookingService.getBookingbyId(bookingId).subscribe(
      (booking: TblBooking) => {
        this.selectedBooking = booking;
        console.log("booking : ", this.selectedBooking);
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin booking:', error);
      }
    );
  }

  openBookingModal(bookingId: number) {
    // Tìm và gán booking tương ứng
    this.selectedBooking = this.bookings.find(b => b.bookingId === bookingId);
  }

  closeEditForm() {
    this.selectedBooking = undefined;
  }
  
  getBookingForShiftField(shiftField: ShiftFieldWithSelection, smallFieldId: number = 0): TblBooking | undefined {
    return this.bookings.find(booking =>
      booking.shiftFieldId === shiftField.id && 
      booking.smallFieldId === smallFieldId &&
      booking.timeStart === shiftField.timeStart &&
      booking.timeEnd === shiftField.timeEnd &&
      new Date(booking.day ?? '').toDateString() === new Date(this.selectedDate ?? '').toDateString()
    );
  }
  
  

  filterByFieldType(): void {
    if (this.selectedFieldType) {
      this.filteredSmallFields = this.smallFields.filter(field => field.fieldType === this.selectedFieldType);
    } else {
      this.filteredSmallFields = this.smallFields; // Show all if no type selected
    }
  }
  
}