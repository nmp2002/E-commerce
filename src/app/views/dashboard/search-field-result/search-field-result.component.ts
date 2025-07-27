import { Component, Input, OnInit,AfterViewInit, ViewChild } from '@angular/core';
import { FieldService } from '../../../_services/field.service';
import { TblField } from '../../../model/tblField';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ShiftService } from '../../../_services/ShiftService.service';
import { TblShiftField } from '../../../model/tblShiftField';
import { TblSmallField } from '../../../model/tblSmallField';
import { ShiftFieldService } from '../../../_services/shiftfield.service';
import { BookingService } from '../../../_services/booking.service';
import Swal from 'sweetalert2';
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
    // Bán kính 10km, sử dụng đơn vị km (10000m = 10km)
 radius = 10; // Bán kính 10km
  fieldId: number[] = [];
  shiftFieldsMap: { [key: string]: ShiftFieldWithSelection[] } = {};
  smallFields: TblSmallField[] = [];
  paginatedShifts: any[] = [];  // Mảng lưu trữ dữ liệu phân trang
  currentPage: number = 1;  // Trang hiện tại
  itemsPerPage: number = 5;
  filteredFields: any[] = [];  // Danh sách sân đã được lọc
  filteredShifts: any[] = [];  // Danh sách các ca sân đã được lọc
  selectedFieldName: string = '';  // Biến lưu tên sân đã chọn
  showFieldDetailModal: boolean = false;
    // Biến phân trang cho fields
    currentPageFields: number = 1;
  itemsPerPageFields: number = 6;
  nearbyFields: any[] = [];
  constructor(private route: ActivatedRoute, private fieldService: FieldService, private router: Router,private httpClient: HttpClient,private shiftService: ShiftService,    private shiftFieldService: ShiftFieldService,  private bookingService: BookingService,) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Nếu điều hướng tới trang chủ hoặc các trang bạn chỉ định, reset sessionStorage
        if (event.url === '/' || event.url === '/homepage') {
          this.resetSessionState();  // Xóa sessionStorage khi về trang chủ
        }
      }
    });

    const provinceid = sessionStorage.getItem('provinceid');
    const districtId = sessionStorage.getItem('districtId');
    const wardId = sessionStorage.getItem('wardId');
    this.restoreState();
    if (provinceid) {
      this.fieldService.getCities().subscribe((provinces: any[]) => {
        const province = provinces.find((p: any) => p.provinceid === Number(provinceid));
        const provinceName = province?.provinceName || '';



        if (districtId) {
          this.fieldService.getDistrictsByCityId(Number(provinceid)).subscribe((districts: any[]) => {
            const district = districts.find((d: any) => d.districtId === Number(districtId));
            const districtName = district?.districtName || '';

            if (wardId) {
              this.fieldService.getWardsByDistrictId(Number(districtId)).subscribe((wards: any[]) => {
                const ward = wards.find((w: any) => w.wardId === Number(wardId));
                const wardName = ward?.wardName || '';

                console.log("📡 Lấy sân theo: ", { provinceName, districtName, wardName });
                this.getFields('', districtName, provinceName, wardName, '', 1, 10);
              });
            } else {
              console.log("📡 Lấy sân theo: ", { provinceName, districtName });
              this.getFields('', districtName, provinceName, '', '', 1, 10);
            }
          });
        } else {
          console.log("📡 Lấy sân theo: ", { provinceName });
          this.getFields('', '', provinceName, '', '', 1, 10);
        }
      });
    } else {
      console.log('❌ Không có dữ liệu provinceid trong sessionStorage');
    }

  }



  // Hàm reset sessionStorage khi về trang chủ hoặc trang nhất định
  resetSessionState(): void {
    sessionStorage.removeItem('provinceid');
    sessionStorage.removeItem('districtId');
    sessionStorage.removeItem('wardId');
    // Xóa thêm bất kỳ thông tin nào cần reset trong sessionStorage
  }

  // Lưu trạng thái của component trước khi điều hướng
  saveState(): void {
    const state = {
      fields: this.fields,
      paginatedShifts: this.paginatedShifts,
      currentPage: this.currentPage,
      currentPageFields: this.currentPageFields,
    };
    sessionStorage.setItem('componentState', JSON.stringify(state));
  }

  // Khôi phục trạng thái từ sessionStorage
  restoreState(): void {
    const savedState = sessionStorage.getItem('componentState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.fields = state.fields || [];
      this.paginatedShifts = state.paginatedShifts || [];
      this.currentPage = state.currentPage || 1;
      this.currentPageFields = state.currentPageFields || 1;
    }
  }
  getFields(fieldName: string, districtName: string, provinceName: string, wardName: string, status: string, page: number, size: number): void {
    this.fieldService.getFields(fieldName, districtName, provinceName, wardName, status, page, size).subscribe({
      next: (data: any) => {
        this.fields = data.content;
        console.log(data);
     // Nếu muốn lấy danh sách các `id` từ mảng
        this.fieldId = this.fields.map((field: any) => field.id);
        this.loadSmallFields();
        this.filterFields();  // Lọc lại các sân khi đã lấy dữ liệu
     console.log(this.fieldId);
      },
      error: (err: any) => {
        console.error('Error retrieving fields', err);
      }
    });
  }
  filterFields(): void {
    if (this.selectedFieldName) {
      this.filteredFields = this.fields.filter(field => field.fieldName === this.selectedFieldName);
    } else {
      this.filteredFields = this.fields;  // Hiển thị tất cả sân khi chưa chọn tên sân
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

    const currentState = {
      fields: this.fields,  // Lưu toàn bộ danh sách sân
      currentPage: this.currentPage,
      selectedFieldId: field.id
    };
    this.router.navigate(['/homepage/smallFields'], { state: currentState });;
  }
  bookFields(shift: any): void {
    localStorage.setItem('fieldId', shift.fieldId.toString());
    localStorage.setItem('provinceId', shift.provinceid);
    localStorage.setItem('districtId', shift.districtId);
    localStorage.setItem('wardId', shift.wardId);
    console.log('Field data stored in localStorage:', {
      fieldId: shift.fieldId,
      provinceid: shift.provinceid,
      districtId: shift.districtId,
      wardId: shift.wardId,
    });

    // Điều hướng sang trang smallFields
    this.router.navigate(['/homepage/smallFields']);
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
  paginateFields() {
    const startIndex = (this.currentPageFields - 1) * this.itemsPerPageFields;
    this.filteredFields = this.fields.slice(startIndex, startIndex + this.itemsPerPageFields);
  }

 // Chuyển đến trang tiếp theo cho fields
 nextPageFields() {
  if (this.currentPageFields < this.totalPagesFields()) {
    this.currentPageFields++;
    this.paginateFields();
  }
}

// Chuyển về trang trước cho fields
prevPageFields() {
  if (this.currentPageFields > 1) {
    this.currentPageFields--;
    this.paginateFields();
  }
}

// Tổng số trang cho fields
totalPagesFields() {
  return Math.ceil(this.fields.length / this.itemsPerPageFields);
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

  // Định nghĩa kiểu mở rộng
  type ExtendedShiftField = TblShiftField & {
    smallFieldName: string;
    fieldName: string;
    amount: number;
    provinceid?: number | null;
    districtId?: number | null;
    wardId?: number | null;
  };

  const closestShiftByFieldType: { [fieldType: string]: ExtendedShiftField } = {};

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
        const fetchFieldDetailsPromises = futureShifts.map((shift, index) => {
          const isBooked = bookingResults[index];
          if (shift.fieldType && !isBooked) {
            // Nếu ca chưa bị đặt, gọi API để lấy thông tin chi tiết field
            return this.fieldService.findByIdField(smallField.fieldId!).toPromise().then((fieldDetails) => {
              const amount = isWeekend
                ? Number(shift.amountWeekend || 0)
                : Number(shift.amountWeekday || 0);

              if (shift.fieldType && !closestShiftByFieldType[shift.fieldType]) {
                closestShiftByFieldType[shift.fieldType] = {
                  ...shift,
                  id: smallField.id,
                  fieldId: smallField.fieldId,
                  smallFieldName: smallField.smallFieldName || '',
                  fieldName,
                  provinceid: fieldDetails.provinceid || null,
                  districtId: fieldDetails.districtId || null,
                  wardId: fieldDetails.wardId || null,
                  amount,
                };
              }
            });
          }
          return Promise.resolve(); // Nếu không cần gọi API, trả về Promise đã giải quyết
        });

        Promise.all(fetchFieldDetailsPromises).then(() => {
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
        });
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



  getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt vị trí trên thiết bị của bạn.');
            reject(error);
          }
        );
      } else {
        alert('Trình duyệt của bạn không hỗ trợ Geolocation.');
        reject(new Error('Geolocation not supported'));
      }
    });
  }
   // Lấy vị trí hiện tại của người dùng và tìm các sân gần
   async getCurrentLocationAndFindNearbyFields() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Gọi hàm tìm sân gần
        await this.findNearbyFields(lat, lng);
        this.showFieldDetailModal = true; // Mở modal khi tìm kiếm xong
      }, (error) => {
        console.error("Không thể lấy vị trí người dùng:", error);
      });
    } else {
      alert("Trình duyệt không hỗ trợ Geolocation");
    }
  }

  // Hàm tìm sân gần
  async findNearbyFields(lat: number, lng: number): Promise<void> {
    const radiusInKm = this.radius; // Bán kính trong km từ giao diện
    const nearbyFields: any[] = [];

    for (const field of this.fields) {
      const address = field.address;

      if (address) {
        console.log('Đang geocode địa chỉ: ', address);

        // Geocode địa chỉ để lấy tọa độ
        const fieldLocation = await this.geocodeAddress(address);

        if (fieldLocation) {
          const fieldLat = fieldLocation.lat;
          const fieldLng = fieldLocation.lng;

          console.log(`Địa chỉ ${address} đã geocode thành công với tọa độ: lat=${fieldLat}, lng=${fieldLng}`);

          // Tính khoảng cách từ vị trí người dùng đến sân
          const distanceData = await this.getDistanceMatrix(lat, lng, fieldLat, fieldLng);

          if (distanceData) {
            const distance = distanceData.distance; // Khoảng cách từ DistanceMatrix API
            console.log(`Khoảng cách đến sân ${address}: ${distance} km`);

            // Nếu khoảng cách trong bán kính, thêm vào danh sách sân gần
            if (distance <= radiusInKm) {
              nearbyFields.push({ ...field, distance });
            }
          } else {
            console.log(`Không thể lấy khoảng cách từ người dùng đến sân ${address}`);
          }
        } else {
          console.log(`Không thể geocode địa chỉ: ${address}`);
        }
      } else {
        console.warn('Không có địa chỉ cho sân:', field);
      }
    }

    // Lưu danh sách sân gần vào biến nearbyFields
    this.nearbyFields = nearbyFields;

    // Sau khi duyệt qua tất cả các sân, lọc ra danh sách sân gần
    console.log('Danh sách sân gần: ', nearbyFields);
    if (nearbyFields.length > 0) {
      Swal.fire({
        icon: 'success',
        title: `Có ${nearbyFields.length} sân trong phạm vi ${radiusInKm} km.`,
        text: nearbyFields.map(field => `${field.fieldName} - ${field.distance} km`).join('\n')
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Không có sân nào trong phạm vi.',
      });
    }
  }
 // Hàm đóng modal
 closeModal() {
  this.showFieldDetailModal = false;
}



  // Hàm lấy thông tin khoảng cách từ DistanceMatrix API
  async getDistanceMatrix(originLat: number, originLng: number, destLat: number, destLng: number): Promise<any | null> {
    const apiKey = 'eCzyKs6NbbagJ71z29WTADBByX1zwTOC27NputFm'; // API key Goong
    const url = `https://rsapi.goong.io/DistanceMatrix?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&vehicle=car&api_key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.rows && data.rows[0]?.elements && data.rows[0].elements[0]?.status === 'OK') {
        const distance = data.rows[0].elements[0].distance.value; // Khoảng cách tính bằng mét
        return { distance: distance / 1000 }; // Trả về khoảng cách tính bằng km
      }
    } catch (error) {
      console.error('Lỗi khi gọi DistanceMatrix API:', error);
    }
    return null; // Trả về null nếu có lỗi
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
  async openMapToAddress(destination: string): Promise<void> {
    try {
      // Lấy vị trí hiện tại
      const position = await this.getCurrentLocation();
      const { latitude, longitude } = position;

      // Geocode địa chỉ đích đến để lấy tọa độ
      const destinationLocation = await this.geocodeAddress(destination);
      if (!destinationLocation) {
        alert('Không thể tìm được địa chỉ đích.');
        return;
      }
      const { lat: destinationLat, lng: destinationLng } = destinationLocation;

      // Tạo URL cho Distance Matrix API với tọa độ đã geocode của đích đến
      const distanceMatrixUrl = `https://rsapi.goong.io/DistanceMatrix?origins=${latitude},${longitude}&destinations=${destinationLat},${destinationLng}&vehicle=car&api_key=eCzyKs6NbbagJ71z29WTADBByX1zwTOC27NputFm`;

      // Gọi API để lấy thông tin khoảng cách
      const response = await fetch(distanceMatrixUrl);
      const data = await response.json();

      // Xử lý phản hồi từ API
      console.log('API response:', data);
      if (data && data.rows && data.rows.length > 0) {
        const row = data.rows[0];
        if (row.elements && row.elements.length > 0) {
          const element = row.elements[0];
          // Kiểm tra nếu status của element là OK
          if (element.status === 'OK') {
            const distance = element.distance.text;
            const duration = element.duration.text;
            console.log(`Distance: ${distance}, Duration: ${duration}`);

            // Mở bản đồ Goong với thông tin về vị trí xuất phát và đích đến
            const mapsUrl = `https://maps.goong.io/?direction=${latitude},${longitude}%26${destinationLat},${destinationLng}&api_key=eCzyKs6NbbagJ71z29WTADBByX1zwTOC27NputFm`;

            window.open(mapsUrl, '_blank');
          } else {
            console.error('API Error: Element status is not OK', element);
            alert('Không thể lấy thông tin khoảng cách. Lỗi từ API.');
          }
        } else {
          console.error('API Error: No elements found in rows', row);
          alert('Không thể lấy thông tin khoảng cách. Lỗi từ API.');
        }
      } else {
        console.error('API Error: No rows found', data);
        alert('Không thể lấy thông tin khoảng cách. Lỗi từ API.');
      }
    } catch (error) {
      // Bắt lỗi và thông báo cho người dùng
      console.error('Error getting current location or fetching distance matrix:', error);
      alert('Không thể lấy vị trí hiện tại hoặc thông tin khoảng cách.');
    }
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
