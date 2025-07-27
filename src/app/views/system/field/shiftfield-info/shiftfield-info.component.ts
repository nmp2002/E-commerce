import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TblShiftField } from '../../../../model/tblShiftField';
import { ShiftFieldService } from '../../../../_services/shiftfield.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-shiftfield-info',
  templateUrl: './shiftfield-info.component.html',
  styleUrls: ['./shiftfield-info.component.scss']
})
export class ShiftFieldInfoComponent implements OnChanges {
  @Input() shiftFields: TblShiftField[] = [];
  @Input() showInfoModal: boolean = false;
  @Output() showInfoModalChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  filteredShiftFields: TblShiftField[] = [];
  fieldTypes: string[] = [];
  selectedFieldType: string = '';

  editingShiftField: TblShiftField | null = null;

  constructor(private shiftFieldService: ShiftFieldService,
    private tokenStorageService: TokenStorageService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['shiftFields'] && this.shiftFields.length > 0) {
      this.extractFieldTypes();
      this.sortShiftFields();
      this.filterShiftFields(); // Cập nhật danh sách ca sân hiển thị
    }
  }

  closeInfoModal() {
    this.showInfoModal = false;
    this.showInfoModalChange.emit(this.showInfoModal);
  }

  editShiftField(shiftField: TblShiftField) {
    this.editingShiftField = { ...shiftField }; // Clone the shiftField object
  }

  saveEditedShiftField() {
    if (this.editingShiftField) {
      const {
        id,
        fieldId,
        shiftFieldName,
        createdBy,
        createdDate,
        modifiedDate,
        modifiedBy,
        timeStart,
        timeEnd,
        amountWeekday,
        amountWeekend,
        dayOfWeek,
        day,
        statusField,
        fieldType
      } = this.editingShiftField;
  
      console.log('Editing shift field ID:', id);
  
      if (id !== undefined && fieldId !== undefined && shiftFieldName !== undefined) {
        this.shiftFieldService.updateShiftField(
          id,
          fieldId,
          shiftFieldName,
          createdBy || '',
          createdDate || new Date(),
          modifiedDate || new Date(),
          modifiedBy || '',
          timeStart || '',
          timeEnd || '',
          amountWeekday || '',
          amountWeekend || '',
          dayOfWeek || '',
          day || new Date(),
          statusField || '',
          fieldType || ''
        ).subscribe({
          next: (response) => {
            const index = this.shiftFields.findIndex(field => field.id === this.editingShiftField!.id);
            if (index !== -1) {
              this.shiftFields[index] = this.editingShiftField!;
              // Emit event to notify parent component of changes
              this.showInfoModalChange.emit(false); // Close modal
            }
            this.editingShiftField = null;
            console.log('Field saved successfully', response);
            // Thông báo thành công
            Notify.success('Field saved successfully', {
              success: {
                childClassName: 'notiflix-notify-success'
              }
            });
          },
          error: (error) => {
            console.error('Error updating shift field', error);
            Notify.failure('Error updating shift field: ' + (error.message || error.statusText), {
              failure: {
                childClassName: 'notiflix-notify-failure'
              }
            });
          },
          complete: () => {
          }
        });
      }
    }
  }
  
  cancelEdit() {
    this.editingShiftField = null;
  }

  private sortShiftFields() {
    this.shiftFields.sort((a, b) => {
      const nameA = a.shiftFieldName?.toString() || '';
      const nameB = b.shiftFieldName?.toString() || '';

      const numA = parseFloat(nameA);
      const numB = parseFloat(nameB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return nameA.localeCompare(nameB);
      }
    });
    this.filterShiftFields(); 
  }
  

  private extractFieldTypes() {
    // Tạo Set để loại bỏ các giá trị trùng lặp
    const uniqueTypes = new Set(this.shiftFields.map(field => field.fieldType).filter((value): value is string => value !== undefined));
    this.fieldTypes = Array.from(uniqueTypes);
  }

  filterShiftFields() {
    if (this.selectedFieldType) {
      this.filteredShiftFields = this.shiftFields.filter(field => field.fieldType === this.selectedFieldType);
    } else {
      this.filteredShiftFields = this.shiftFields;
    }
  }
  deleteShiftField(id: number): void {
    console.log('Bắt đầu yêu cầu xóa shift field với ID:', id);
  
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa shift field này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      console.log('Kết quả từ Swal:', result);
  
      if (result.isConfirmed) {
        console.log('Xác nhận xóa, gọi API deleteShiftField');
        
        this.shiftFieldService.deleteshiftField(id).subscribe({
          next: () => {
            console.log('API trả về thành công, xóa shift field khỏi danh sách');
            
            // Xóa shift field khỏi danh sách
            this.shiftFields = this.shiftFields.filter(shiftField => shiftField.id !== id);
            console.log('Danh sách sau khi xóa:', this.shiftFields);
  
            this.filterShiftFields(); // Cập nhật danh sách hiển thị
            console.log('Danh sách đã được lọc lại');
  
            // Thông báo thành công
            Swal.fire({
              icon: 'success',
              title: 'Xóa thành công!',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Đồng ý'
            });
          },
          error: (error) => {
            console.log('Lỗi khi gọi API xóa:', error);
            console.log('Lỗi khi gọi API xóa:', error);
            console.log('Mã lỗi:', error.status);
            console.log('Thông báo lỗi chi tiết:', error.error);
            // Lấy thông báo lỗi
            const errorMessage = error?.error?.message || error?.message || 'Có lỗi xảy ra khi xóa shift field.';

            // Hiển thị thông báo lỗi
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: errorMessage,
              confirmButtonColor: '#d33',
              confirmButtonText: 'Đóng'
            });
          }
        });
      } else {
        console.log('Người dùng đã hủy xóa.');
      }
    });
  }
  
  
  
}
