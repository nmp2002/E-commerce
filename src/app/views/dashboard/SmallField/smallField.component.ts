import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '../../../_services/field.service';
import { ShiftFieldService } from '../../../_services/shiftfield.service';
import { BookingService } from '../../../_services/booking.service';
import { TblSmallField } from '../../../model/tblSmallField';
import { TblShiftField } from '../../../model/tblShiftField';
import { TblBooking } from '../../../model/tblBooking';
import { TblField } from '../../../model/tblField';
import { ShiftService } from '../../../_services/ShiftService.service';
import { formatDate ,DatePipe ,} from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
interface ShiftFieldWithSelection extends TblShiftField {
  selected?: boolean;
  smallFieldName?: string; 
  smallFieldId?: number;   
}

@Component({
  selector: 'app-smallField',
  templateUrl: './smallField.component.html',
  styleUrls: ['./smallField.component.scss'],
  providers: [DatePipe]
})
export class SmallFieldComponent implements OnInit {
  bookingForm: FormGroup;
  @Output() sendAvailableShift: EventEmitter<any> = new EventEmitter<any>();
  @Input() fields: TblField[] = [];
  
  smallFields: TblSmallField[] = [];
  fieldId: number;
  provinceName: string;
  districtName: string;
  wardName: string;
  selectedDate: string;
  shiftFieldsMap: { [key: string]: ShiftFieldWithSelection[] } = {};
  bookings: TblBooking[] = [];
  minDate: string;
  currentTime: Date;
  bookingFormVisible: boolean = false;
  bookingName: string = '';
  bookingPhone: string = '';
  bookingEmail: string = '';
  bookingShiftInfo: string = '';
  submitted: boolean = false;
  selectedShiftFields: ShiftFieldWithSelection[] = [];

  availableSmallFields: any[] = [];  // Mảng chứa các shift và smallField
  closestAvailableShift: any = null;
  constructor(
    private route: ActivatedRoute,
    private fieldService: FieldService,
    private shiftFieldService: ShiftFieldService,
    private bookingService: BookingService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private shiftService:ShiftService
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
    const storedFieldId = localStorage.getItem('fieldId');
    const storedProvinceId = localStorage.getItem('provinceId');
    const storedDistrictId = localStorage.getItem('districtId');
    const storedWardId = localStorage.getItem('wardId');

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
      console.log("1:", this.fieldId);
      this.loadSmallFields();
      this.loadBookings();
    } else {
      console.error('Field ID or location data not found in session storage.');
    }
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  ngOnDestroy(): void {
    localStorage.removeItem('fieldId');
    localStorage.removeItem('provinceid');
    localStorage.removeItem('districtId');
    localStorage.removeItem('wardId');
    console.log('Cleared session storage values.');
  }
  loadSmallFields(): void {
    this.fieldService.getSmallFieldsByFieldId(this.fieldId).subscribe(data => {
      this.smallFields = data.map(field => ({
        ...field,
        status: field.status !== undefined ? +field.status : 0
      }));
      this.loadShiftFields();
    });
  }

  loadShiftFields(): void {
    this.shiftFieldsMap = {}; // Khởi tạo lại bản đồ ca sân
  
    // Tạo một mảng các Promise để xử lý tất cả các yêu cầu song song
    const loadShiftFieldPromises = this.smallFields.map(smallField => {
      return this.shiftFieldService.getShiftFieldsByFieldType(this.fieldId, smallField.fieldType || '').toPromise()
        .then((shiftFields: TblShiftField[] | undefined) => {
          // Kiểm tra nếu shiftFields không phải là undefined
          if (!shiftFields) {
            console.warn(`No shift fields available for fieldType ${smallField.fieldType}`);
            return;
          }
  
          // Sắp xếp các ca sân theo số (chuyển đổi shiftFieldName thành số)
          const sortedShiftFields = shiftFields.sort((a, b) => {
            const aName = parseFloat(a.shiftFieldName ? a.shiftFieldName.toString() : '0'); // Chuyển shiftFieldName thành số
            const bName = parseFloat(b.shiftFieldName ? b.shiftFieldName.toString() : '0'); // Chuyển shiftFieldName thành số
            return aName - bName; // Sắp xếp theo giá trị số
          });
  
          // Cập nhật bản đồ ca sân với thông tin `smallFieldId`
          this.shiftFieldsMap[smallField.fieldType || ''] = sortedShiftFields.map(shiftField => ({
            ...shiftField,
            selected: false,
            smallFieldId: smallField.id // Thêm smallFieldId vào mỗi ca sân
          }));
        })
        .catch((error) => {
          console.error(`Error loading shift fields for smallFieldId ${smallField.id}:`, error);
        });
    });
  
    // Sau khi tất cả các ca sân được tải xong, gọi `loadBookings`
    Promise.all(loadShiftFieldPromises)
      .then(() => {
        this.loadBookings(); // Chỉ gọi một lần khi tất cả dữ liệu đã được tải xong
      })
      .catch((error) => {
        console.error('Error processing shift fields:', error);
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
  
 
  
  
  
  
  getBookingStatusForField(smallFieldId: number): string {
    const currentDate = this.datePipe.transform(this.currentTime, 'yyyy-MM-dd');
    const currentTime = this.datePipe.transform(this.currentTime, 'HH:mm:ss');
  
    if (!currentDate || !currentTime) {
      console.log('Không thể chuyển đổi thời gian hoặc ngày hiện tại');  
      return 'Sẵn sàng'; 
    }
    // Tìm booking phù hợp
    const matchingBooking = this.bookings.find(booking => {
      const bookingDate = this.datePipe.transform(booking.day, 'yyyy-MM-dd');
      const startTime = booking.timeStart || '00:00:00';  // Nếu không có timeStart, mặc định là '00:00:00'
      const endTime = booking.timeEnd || '23:59:59';      // Nếu không có timeEnd, mặc định là '23:59:59'
 
      return booking.smallFieldId === smallFieldId &&
        bookingDate === currentDate &&
        currentTime >= startTime && currentTime <= endTime;
    });
  
    if (matchingBooking) {
      // Hàm ẩn số điện thoại
      const maskedPhoneNumber = this.maskPhoneNumber(matchingBooking.phoneNumberGuest || '');
      return `Tên người đặt: ${matchingBooking.nameGuest || 'N/A'}, Số điện thoại: ${maskedPhoneNumber}`;
    }
  
    console.log('Không có booking nào phù hợp');
    return 'Sẵn sàng'; 
  }
  
  // Hàm để ẩn số điện thoại
  maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 6) {
      return phoneNumber; // Nếu số điện thoại quá ngắn thì không ẩn
    }
  
    const start = phoneNumber.slice(0, 3); // Giữ 3 số đầu
    const end = phoneNumber.slice(-3); // Giữ 3 số cuối
    const masked = phoneNumber.slice(3, -3).replace(/\d/g, '*'); // Thay thế các số giữa bằng dấu '*'
  
    return `${start}****${end}`; // Trả về số điện thoại đã ẩn
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
          ).subscribe(response => {
            const bookingId = response.id;
        
            if (bookingId) {
              this.router.navigate(['/dashboard/payment', bookingId]);
            } else {
              console.error('Failed to retrieve booking ID.');
            }
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
}