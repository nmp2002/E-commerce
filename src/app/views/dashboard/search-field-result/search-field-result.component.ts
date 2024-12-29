import { Component, Input, OnInit,AfterViewInit, ViewChild } from '@angular/core';
import { FieldService } from '../../../_services/field.service';
import { TblField } from '../../../model/tblField';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ShiftService } from '../../../_services/ShiftService.service';
import { TblShiftField } from '../../../model/tblShiftField';
import { TblSmallField } from '../../../model/tblSmallField';
import { ShiftFieldService } from '../../../_services/shiftfield.service';
import { BookingService } from '../../../_services/booking.service';
interface ShiftFieldWithSelection extends TblShiftField {
  selected?: boolean;
  smallFieldName?: string; 
  smallFieldId?: number;   
}
@Component({
  selector: 'app-search-field-result',
  templateUrl: './search-field-result.component.html',
  styleUrls: ['./search-field-result.component.scss']
})
export class SearchFieldResultComponent implements OnInit {
  @Input() fields: TblField[] = [];
  closestAvailableShifts: any[] = []; 
  fieldId: number[] = [];
  shiftFieldsMap: { [key: string]: ShiftFieldWithSelection[] } = {};
  smallFields: TblSmallField[] = [];
  paginatedShifts: any[] = [];  // Mảng lưu trữ dữ liệu phân trang
  currentPage: number = 1;  // Trang hiện tại
  itemsPerPage: number = 5;
  constructor(private route: ActivatedRoute, private fieldService: FieldService, private router: Router,private httpClient: HttpClient,private shiftService: ShiftService,    private shiftFieldService: ShiftFieldService,  private bookingService: BookingService,) {}

  ngOnInit(): void {
    const provinceid = sessionStorage.getItem('provinceid');
    const districtId = sessionStorage.getItem('districtId');
    const wardId = sessionStorage.getItem('wardId');
   
    if (provinceid) {
      this.fieldService.getCities().subscribe((provinces: any[]) => {
        const province = provinces.find((p: any) => p.provinceId === Number(provinceid));
        const provinceName = province?.provinceName || '';
  
        if (districtId) {
          this.fieldService.getDistrictsByCityId(Number(provinceid)).subscribe((districts: any[]) => {
            const district = districts.find((d: any) => d.districtId === Number(districtId));
            const districtName = district?.districtName || '';
  
            if (wardId) {
              this.fieldService.getWardsByDistrictId(Number(districtId)).subscribe((wards: any[]) => {
                const ward = wards.find((w: any) => w.wardId === Number(wardId));
                const wardName = ward?.wardName || '';
  
                // Gọi hàm getFields dựa trên wardName
                this.getFields('', districtName, provinceName, wardName, '', 1, 10);
              });
            } else {
              // Gọi hàm getFields dựa trên districtName
              this.getFields('', districtName, provinceName, '', '', 1, 10);
            }
          });
        } else {
          // Gọi hàm getFields dựa trên provinceName
          this.getFields('', '', provinceName, '', '', 1, 10);
        }
      });

    } else {
      console.log('Không có dữ liệu provinceid trong sessionStorage');
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('fieldId');
    sessionStorage.removeItem('provinceid');
    sessionStorage.removeItem('districtId');
    sessionStorage.removeItem('wardId');
    console.log('Cleared session storage values.');
  }
  getFields(fieldName: string, districtName: string, provinceName: string, wardName: string, status: string, page: number, size: number): void {
    this.fieldService.getFields(fieldName, districtName, provinceName, wardName, status, page, size).subscribe({
      next: (data: any) => {
        this.fields = data.content;
        console.log(data);
     // Nếu muốn lấy danh sách các `id` từ mảng
        this.fieldId = this.fields.map((field: any) => field.id);
            this.loadSmallFields();
     console.log(this.fieldId);
      },
      error: (err: any) => {
        console.error('Error retrieving fields', err);
      }
    });
  }


  loadSmallFields(): void {
    const smallFieldsRequests = this.fieldId.map((id: number) => 
      this.fieldService.getSmallFieldsByFieldId(id).toPromise()
    );
  
    Promise.all(smallFieldsRequests)
      .then((responses) => {
        responses.forEach((data: any) => {
          const newSmallFields = data.map((field: any) => ({
            ...field,
            status: field.status !== undefined ? +field.status : 0
          }));
          
          this.smallFields = [...this.smallFields, ...newSmallFields];
        });
        this.loadShiftFields();  // Khi đã load xong smallFields, mới tiếp tục load shiftFields
      })
      .catch((err) => {
        console.error('Error loading small fields:', err);
      });
  }
  

  loadShiftFields(): void {
    this.shiftFieldsMap = {}; // Khởi tạo lại bản đồ ca sân
  
    // Duyệt qua tất cả các smallField để tải shiftFields cho mỗi smallField
    this.smallFields.forEach(smallField => {
      // Chỉ lấy shiftFields cho smallField
      this.shiftFieldService.getShiftFieldsByFieldType(smallField.fieldId!, smallField.fieldType || '').subscribe({
        next: (shiftFields: TblShiftField[]) => {
          const sortedShiftFields = shiftFields.sort((a, b) => {
            const aName = (a.shiftFieldName || '').toString();
            const bName = (b.shiftFieldName || '').toString();
            return aName.localeCompare(bName);
          });
  
          // Gán kết quả vào shiftFieldsMap
          this.shiftFieldsMap[smallField.fieldType || ''] = [
            ...(this.shiftFieldsMap[smallField.fieldType || ''] || []),
            ...sortedShiftFields.map(shiftField => ({
              ...shiftField,
              selected: false,
              smallFieldId: smallField.id // Gán smallFieldId cho ca sân
            }))
          ];
  
          console.log('Updated shiftFieldsMap:', this.shiftFieldsMap);
          this.sendAvailableShiftsToSearchComponent(smallField, sortedShiftFields);
        },
        error: (error) => {
          console.error('Error loading shift fields:', error);
        }
      });
    });
  }

  private formatDateToCustomFormat(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Định dạng ngày thành 2 chữ số
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // Lấy tên tháng viết tắt và chuyển sang chữ hoa
    const year = String(date.getFullYear()).slice(-2); // Lấy 2 chữ số cuối của năm
    const hours = String(date.getHours()).padStart(2, '0'); // Định dạng giờ thành 2 chữ số
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Định dạng phút thành 2 chữ số
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Định dạng giây thành 2 chữ số
  
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
  
  
 // Hàm phân trang
 paginateShifts() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedShifts = this.closestAvailableShifts.slice(startIndex, endIndex);
}

// Chuyển sang trang tiếp theo
nextPage() {
  if (this.currentPage < this.totalPages()) {
    this.currentPage++;
    this.paginateShifts();
  }
}

// Quay lại trang trước
prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.paginateShifts();
  }
}

// Tổng số trang
totalPages() {
  return Math.ceil(this.closestAvailableShifts.length / this.itemsPerPage);
}

// Hàm gửi các ca gần nhất vào phân trang
async sendAvailableShiftsToSearchComponent(
  smallField: TblSmallField,
  shiftFields: TblShiftField[]
): Promise<void> {
  const currentTime = new Date();
  const currentDateOnly = new Date(currentTime.toDateString() + ' 07:00:00');
  const formattedDate = this.formatDateToCustomFormat(currentDateOnly);

  const isWeekend = currentDateOnly.getDay() === 0 || currentDateOnly.getDay() === 6;

  const closestShiftByFieldType: { [fieldType: string]: TblShiftField & { smallFieldName: string, fieldName: string, amount: number } } = {};

  const futureShifts = shiftFields.filter((shift) => {
    const shiftStartTime = new Date(currentDateOnly.toDateString() + ' ' + shift.timeStart);
    return shiftStartTime >= currentTime;
  });

  if (futureShifts.length === 0) {
    console.log('No future shifts available.');
    return;
  }

  futureShifts.sort((a, b) => {
    const shiftStartTimeA = new Date(currentDateOnly.toDateString() + ' ' + a.timeStart).getTime();
    const shiftStartTimeB = new Date(currentDateOnly.toDateString() + ' ' + b.timeStart).getTime();
    return shiftStartTimeA - shiftStartTimeB;
  });

  // Lấy fieldName bằng cách sử dụng subscribe
  this.fieldService.findByIdField(smallField.fieldId!).subscribe({
    next: (fieldResponse) => {
      const fieldName = fieldResponse?.fieldName || 'Unknown';

      const bookingCheckPromises = futureShifts.map((shift) =>
        this.bookingService
          .checkBookingExistence(smallField.id!, shift.timeStart!, formattedDate)
          .toPromise()
      );

      Promise.all(bookingCheckPromises).then((bookingResults) => {
        futureShifts.forEach((shift, index) => {
          const isBooked = bookingResults[index];
          if (shift.fieldType && !isBooked) {
            if (!closestShiftByFieldType[shift.fieldType]) {
              const amount = isWeekend
                ? Number(shift.amountWeekend || 0)
                : Number(shift.amountWeekday || 0);

              closestShiftByFieldType[shift.fieldType] = {
                ...shift,
                id: smallField.id,
                fieldId: smallField.fieldId,
                smallFieldName: smallField.smallFieldName || '',
                fieldName,
                amount,
              };
            }
          }
        });

        // Chuyển đối tượng thành mảng
        const availableShiftsArray = Object.values(closestShiftByFieldType);

        // Lưu tất cả các ca gần nhất vào biến toàn cục
        if (!this.closestAvailableShifts) {
          this.closestAvailableShifts = [];
        }
        this.closestAvailableShifts = [...this.closestAvailableShifts, ...availableShiftsArray];

        console.log('Closest Available Shifts Array:', this.closestAvailableShifts);

        // Gọi hàm phân trang sau khi có dữ liệu
        this.paginateShifts();
      }).catch((err) => {
        console.error('Error checking booking existence:', err);
      });
    },
    error: (err) => {
      console.error('Error fetching field name:', err);
    },
  });
}

  









  
  
  
  
  encryptData(id: number): string {
    return btoa(id.toString());
  }

  deleteField(field: any): void {
    if (confirm('Bạn có chắc chắn muốn xóa field này?')) {
      this.fieldService.deleteField(field.id).subscribe(
        () => {
          const provinceid = sessionStorage.getItem('provinceid');
          const districtId = sessionStorage.getItem('districtId');
          const wardId = sessionStorage.getItem('wardId');
          
          if (provinceid && districtId && wardId) {
            this.getFields('', '', '', '', '', 1, 10);
          }
        },
        error => {
          console.error(error);
        }
      );
    }
  }
  
 
  bookField(field: any): void {
    localStorage.setItem('fieldId', field.id.toString());
    localStorage.setItem('provinceId', field.provinceid);
    localStorage.setItem('districtId', field.districtId);
    localStorage.setItem('wardId', field.wardId);
    console.log('Field data stored in localStorage:', {
      fieldId: field.id,
      provinceid: field.provinceid,
      districtId: field.districtId,
      wardId: field.wardId,
    });
  
    // Điều hướng sang trang smallFields
    this.router.navigate(['/dashboard/smallFields']);
  }
  
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log('Current Position:', { latitude, longitude });
  
          // Gửi tọa độ đến API của bạn để tìm sân gần nhất
          this.findNearbyFields(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt vị trí trên thiết bị của bạn.');
        }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ Geolocation.');
    }
  }
  findNearbyFields(lat: number, lng: number): void {
    const radius = 500000; // Bán kính 5km
    const nearbyFields: any[] = [];
    const geocodePromises = []; // Mảng lưu các promise geocode
  
    // Duyệt qua tất cả các sân đã tìm được
    for (const field of this.fields) {
      const address = field.address;
  
      if (address) {
        console.log('Đang geocode địa chỉ: ', address);  // In ra địa chỉ đang geocode
  
        // Geocode địa chỉ và thêm promise vào mảng
        const geocodePromise = this.geocodeAddress(address).then((fieldLocation) => {
          if (fieldLocation) {
            const fieldLat = fieldLocation.lat;
            const fieldLng = fieldLocation.lng;
  
            console.log(`Địa chỉ ${address} đã geocode thành công với tọa độ: lat=${fieldLat}, lng=${fieldLng}`);
  
            // Tính khoảng cách giữa vị trí hiện tại và sân
            const distance = this.calculateDistance(lat, lng, fieldLat, fieldLng);
  
            console.log(`Khoảng cách đến sân ${address}: ${distance} km`);  // In ra khoảng cách
  
            // Nếu khoảng cách trong bán kính, thêm vào danh sách sân gần
            if (distance <= radius) {
              nearbyFields.push({ ...field, distance });
            }
          } else {
            console.log(`Không thể geocode địa chỉ: ${address}`);
          }
        }).catch((error) => {
          console.error(`Lỗi khi geocode địa chỉ ${address}:`, error);
        });
  
        // Thêm promise vào mảng
        geocodePromises.push(geocodePromise);
      } else {
        console.warn('Không có địa chỉ cho sân:', field);
      }
    }
  
    // Sử dụng Promise.all để đợi tất cả các geocode hoàn thành
    Promise.all(geocodePromises).then(() => {
      // Sắp xếp theo khoảng cách (sân gần nhất lên đầu)
      nearbyFields.sort((a, b) => a.distance - b.distance);
  
      // Kiểm tra nếu có sân gần trong phạm vi
      if (nearbyFields.length > 0) {
        console.log('Nearby fields:', nearbyFields); // In ra các sân gần nhất
        const nearestField = nearbyFields[0];
        if (nearestField ) {
          alert(`Sân gần nhất trống ngay lập tức: ${nearestField.name}`);
        } else {
          alert('Không có sân trống ngay lập tức trong phạm vi 5km.');
        }
      } else {
        console.log('Không có sân nào trong phạm vi 5km');
        alert('Không có sân nào trong phạm vi 5km');
      }
    }).catch((error) => {
      console.error('Lỗi khi geocode tất cả các sân:', error);
    });
  }
  
  
  
  
  async geocodeAddress(address: string): Promise<any | null> {
    const apiKey = 'eCzyKs6NbbagJ71z29WTADBByX1zwTOC27NputFm'; // API key Goong
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.results && data.results[0]?.geometry) {
        const location = data.results[0].geometry.location;
        return location; // Trả về tọa độ { lat, lng }
      }
    } catch (error) {
      console.error('Lỗi khi sử dụng Goong API:', error);
    }
    return null; // Trả về null nếu có lỗi
  }
  
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Đơn vị km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Khoảng cách theo km
  }
  
  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
