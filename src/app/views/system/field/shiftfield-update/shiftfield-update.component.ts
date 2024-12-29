import { Component, OnInit } from '@angular/core';
import { FieldService } from '../../../../_services/field.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SupplierService } from '../../../../_services/supplier.service';
import { TblField } from 'src/app/model/tblField';
import { TblShiftField } from '../../../../model/tblShiftField';
import { TblFieldType } from 'src/app/model/tblFieldType';
import { ShiftFieldService } from '../../../../_services/shiftfield.service';
import { BookingService } from '../../../../_services/booking.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TblBooking } from 'src/app/model/tblBooking';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-shiftfield-update',
  templateUrl: './shiftfield-update.component.html',
  styleUrls: ['./shiftfield-update.component.scss']
})
export class ShiftFieldUpdateComponent implements OnInit {
  fields: TblField[] = [];
  selectedField: TblShiftField = {
    timeStart: '00:00',
    timeEnd: '00:00',
    amountWeekday: '',
    amountWeekend: '',
    dayOfWeek: '',
    fieldType: '',
    shiftFieldName: 0,
  };
  // Thêm đối tượng booking mới
  newBooking: any  = {
    fieldId: null,
    guestId: null, // Chưa biết ai đặt, cần phải cập nhật khi người dùng đăng nhập hoặc chọn khách hàng
    shiftFieldId:null , // Tạm thời chưa có thông tin về ca sân, cần cập nhật khi lựa chọn ca sân
    nameField: '',
    nameGuest: '',
    phoneNumberGuest: '',
    totalPayment: '',
    timeStart: null,
    day: null,
    timeEnd: null,
    statusField: '',
    paymentStatus: '',
    createdDate: null,
    createdBy: '',
    modifiedDate: null,
    modifiedBy: ''
  };
  fieldTypeList: TblFieldType[] = [];
  pageable: any = {
    pageNumber: 0,
    pageSize: 10,
  };
  totalPages: number = 0;
  supplierId: number = 0;
  fieldName: string;
  phoneNumberField: string;
  username: string;
  showSetupModal: boolean = false;
  showInfoModal: boolean = false;
  showBookingModal: boolean = false;
  selectedShiftFields: TblShiftField[] = [];
  selectedBookings: TblBooking[] = [];
  count = 0;
  pageSize = 3;
  constructor(
    private fieldService: FieldService,
    private tokenStorageService: TokenStorageService,
    private supplierService: SupplierService,
    private shiftFieldService: ShiftFieldService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit() {
    const currentUser = this.tokenStorageService.getUser();
    this.username = currentUser ? currentUser.username : null;

    if (this.username) {
      this.supplierService.getSupplierBySupplierNameLogin(this.username).subscribe(
        (supplier) => {
          this.supplierId = supplier ? supplier.supplierId ?? 0 : 0;
          if (this.supplierId) {
            this.retrieveFields();
          }
        },
        (error) => {
          console.error('Error fetching supplier info:', error);
        }
      );
    }
  }

  retrieveFields(pageNumber: number = 0) {
    this.pageable.pageNumber = pageNumber;

    this.fieldService.getFieldsBySupplierId(
      this.supplierId,
      this.pageable.pageNumber,
      this.pageable.pageSize,
      this.fieldName,
      this.phoneNumberField
    ).subscribe({
      next: data => {
        this.fields = data;
        this.totalPages = data.totalPages;
      },
      error: err => {
        console.error('Error fetching fields:', err);
      }
    });
  }

  setupField(field: TblField) {
    this.selectedField = {
      id: field.id,
      createdDate: field.createdDate,
      modifiedDate: new Date(),
      modifiedBy: this.username,
      timeStart: '00:00',
      timeEnd: '00:00',
      amountWeekday: '',
      amountWeekend: '',
      dayOfWeek: '',
      fieldType: '',
    };
    this.showSetupModal = true;
    
    if (field.id !== undefined) {
      this.loadFieldTypes(field.id);
    } else {
      console.error('Error: Field ID is not defined');
    }
  }

  loadFieldTypes(fieldId: number) {
    this.fieldService.getFieldTypebyFieldId(fieldId).subscribe(
      (data: TblFieldType[]) => {
        this.fieldTypeList = data;
        if (data.length > 0) {
          this.selectedField.fieldType = data[0].fieldTypeName;
        } else {
          console.error(`No fieldType found for fieldId ${fieldId}`);
        }
      },
      (error) => {
        console.error('Error loading field types:', error);
      }
    );
  }

  saveSetupInfo() {
    const fieldType = this.selectedField.fieldType || '';
  
    const shiftField: TblShiftField = {
      id: this.selectedField.id,
      fieldId: this.selectedField.id,
      shiftFieldName: this.selectedField.shiftFieldName,
      createdBy: this.selectedField.createdBy || '',
      createdDate: new Date(),
      modifiedDate: new Date(),
      modifiedBy: this.username,
      timeStart: this.selectedField.timeStart || '00:00',
      timeEnd: this.selectedField.timeEnd || '00:00',
      amountWeekday: this.selectedField.amountWeekday || '',
      amountWeekend: this.selectedField.amountWeekend || '',
      dayOfWeek: this.selectedField.dayOfWeek || '',
      day: new Date(),
      statusField: this.selectedField.statusField || '',
      fieldType: fieldType
    };
  
    if (shiftField.id !== undefined && shiftField.fieldId !== undefined && shiftField.shiftFieldName !== undefined) {
      this.shiftFieldService.saveShiftField(
        shiftField.id,
        shiftField.fieldId,
        shiftField.shiftFieldName,
        shiftField.createdBy || '',
        shiftField.createdDate || new Date(),
        shiftField.modifiedDate || new Date(),
        shiftField.modifiedBy || '',
        shiftField.timeStart || '',
        shiftField.timeEnd || '',
        shiftField.amountWeekday || '',
        shiftField.amountWeekend || '',
        shiftField.dayOfWeek || '',
        shiftField.day || new Date(),
        shiftField.statusField || '',
        shiftField.fieldType || ''
      ).subscribe({
        next: (response: any) => {
          this.showSetupModal = false;
        },
        error: (error: any) => {
          if (error.status === 400 && error.error.message) {
            // Hiển thị thông báo lỗi từ server
            alert(error.error.message);
          } else {
            console.error('Error saving shift field:', error);
          }
        },
        complete: () => {
          console.log('Save shift field operation completed.');
        }
      });
    }
  }
  

  findField(): void {
    // Lấy thông tin auth-user từ session storage
    const authUser = sessionStorage.getItem('auth-user');
    if (authUser) {
      const parsedUser = JSON.parse(authUser); // Chuyển chuỗi JSON thành object
      const fullname = parsedUser.fullname; // Lấy giá trị fullname từ auth-user
  
      this.fieldService.findField(this.fieldName, this.phoneNumberField, 1, 10).subscribe({
        next: data => {
          // Lọc các fields có supplierName khớp với fullname
          const filteredFields = data.content.filter((field: any) => field.supplierName === fullname);
  
          this.fields = filteredFields; // Gán dữ liệu sau khi lọc
          this.count = filteredFields.length; // Số lượng phần tử sau lọc
          this.pageable = data.pageable; // Giữ lại thông tin phân trang từ API nếu cần
          this.totalPages = Math.ceil(this.count / this.pageSize); // Tính lại tổng số trang
          this.pageSize = data.size; // Kích thước trang
        },
        error: err => {
          console.error(err);
        }
      });
    } else {
      console.error('Auth-user not found in session storage.');
    }
  }
  

  showFieldInfo(field: TblField) {
    if (field.id !== undefined) {
      this.shiftFieldService.getShiftFieldsByFieldId(field.id).subscribe({
        next: (response: TblShiftField[]) => {
          this.selectedShiftFields = response;
          this.showInfoModal = true;
        },
        error: (error: any) => {
          console.error('Error retrieving shift fields:', error);
        },
        complete: () => {
          console.log('Retrieve shift fields operation completed.');
        }
      });
    } else {
      console.error('Field ID is undefined');
    }
  }

  closeInfoModalHandler(isClosed: boolean) {
    this.showInfoModal = isClosed;
  }

  private convertToShiftField(field: TblField): TblShiftField {
    return {
      ...field,
      timeStart: field.timeStart ? new Date(field.timeStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      timeEnd: field.timeEnd ? new Date(field.timeEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      amountWeekday: (field as any).amountWeekday || '',
      amountWeekend: (field as any).amountWeekend || '',
      fieldType: typeof field.fieldType === 'string' ? field.fieldType : ''
    };
  }
  

  closeBookingModalHandler(isClosed: boolean) {
    this.showBookingModal = isClosed;
  }
  checkField(index: number): void {
    const fieldId = this.fields[index].id || '';
    const provinceid = this.fields[index].provinceid || '';
    const districtId = this.fields[index].districtId || '';
    const wardId = this.fields[index].wardId || '';
    sessionStorage.setItem('fieldId', fieldId.toString()); 
    sessionStorage.setItem('provinceid', provinceid.toString());
    sessionStorage.setItem('districtId', districtId.toString());
    sessionStorage.setItem('wardId', wardId.toString());
    this.router.navigate(['/field/field-checking']);
  }
}
