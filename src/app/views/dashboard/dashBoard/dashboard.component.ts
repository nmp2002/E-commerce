import { Component, OnInit } from '@angular/core';
import { FieldService } from '../../../_services/field.service';
import { SupplierService } from '../../../_services/supplier.service';
import { BookingService } from '../../../_services/booking.service';
import { UserService } from '../../../_services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { TblField } from '../../../model/tblField';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';  

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  fields: TblField[] = [];
  totalBookings: number = 0;
  isSuperAdmin: boolean = false;
  todayRevenue: number = 0;
  activeFieldData: any = {}; // Dữ liệu biểu đồ sân đang hoạt động
  maintenanceFieldData: any = {}; // Dữ liệu biểu đồ sân bảo trì
 todayActiveFieldCounts:number = 0;
 todayMaintenanceCount:number = 0;
  availableFields: number = 0;
  activeUsers: number = 0;
  inactiveUsers: number = 0;
  activeFields: number = 0;
  inactiveFields: number = 0;
  pageable: any = {
    pageNumber: 0,
    pageSize: 10,
  };
  totalPages: number = 0;
  supplierId: number = 0;
  fieldName: string;
  phoneNumberField: string;
  username: string;
    // Dữ liệu cho biểu đồ tròn
    fieldStatusData: any;
  fieldBookingCounts: { [key: string]: number } = {};  // Thay đổi kiểu chỉ mục là string để hỗ trợ mọi trường hợp
  fieldRevenues: { [fieldId: string]: number } = {};  // Khai báo đối tượng lưu trữ doanh thu cho mỗi sân
  activeFieldCounts: { [fieldId: string]: number } = {}; // Dữ liệu số lượng sân hoạt động
  maintenanceFieldCounts: { [fieldId: string]: number } = {}; // Dữ liệu số lượng sân bảo trì
  revenueData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [1500000, 2000000, 1700000, 2200000],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }
    ]
  };
  userChartData: any; // Dữ liệu biểu đồ người dùng
fieldChartData: any; // Dữ liệu biểu đồ sân

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  revenueLabels: string[] = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'];

  constructor(
    private fieldService: FieldService,
    private tokenStorageService: TokenStorageService,
    private supplierService: SupplierService,
    private bookingService: BookingService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.checkUserRole(); // Kiểm tra vai trò của người dùng
    
    if (this.isSuperAdmin) {
      // Nếu là superadmin, gọi API để lấy số liệu tổng quan
      this.loadSuperAdminData();
    } else {
      // Nếu là quản lý sân, tiếp tục lấy dữ liệu sân và booking
      this.fetchDashboardData(); 
      const currentUser = this.tokenStorageService.getUser();
      this.username = currentUser ? currentUser.username : null;
    
      if (this.username) {
        this.supplierService.getSupplierBySupplierNameLogin(this.username).subscribe(
          (supplier) => {
            this.supplierId = supplier ? supplier.supplierId ?? 0 : 0;
            if (this.supplierId) {
              this.retrieveFields();  // Gọi retrieveFields để lấy dữ liệu fields
            }
          },
          (error) => {
            console.error('Error fetching supplier info:', error);
          }
        );
      }
    }
  }
  
  // Kiểm tra vai trò của người dùng
  checkUserRole(): void {
    const currentUser = this.tokenStorageService.getUser();
    if (currentUser && currentUser.username === 'superadmin') {
      this.isSuperAdmin = true;
    } else {
      this.isSuperAdmin = false;
    }
  }
  loadSuperAdminData(): void {
    forkJoin({
      activeUsers: this.userService.countActiveUsers(),
      inactiveUsers: this.userService.countInactiveUsers(),
      activeFields: this.fieldService.countActiveFields(),
      inactiveFields: this.fieldService.countInactiveFields()
    }).subscribe({
      next: (results) => {
        this.activeUsers = results.activeUsers;
        this.inactiveUsers = results.inactiveUsers;
        this.activeFields = results.activeFields;
        this.inactiveFields = results.inactiveFields;
        this.prepareChartData(); // Chỉ gọi khi tất cả dữ liệu đã sẵn sàng
      },
      error: (error) => {
        console.error('Error loading data', error);
        // Xử lý lỗi nếu cần thiết
        this.activeUsers = 0;
        this.inactiveUsers = 0;
        this.activeFields = 0;
        this.inactiveFields = 0;
        this.prepareChartData();
      }
    });
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
        console.log('Fields fetched:', this.fields);  // Kiểm tra dữ liệu sau khi lấy về
        if (this.fields && this.fields.length > 0) {
          this.fetchDashboardData();  // Gọi fetchDashboardData sau khi fields có dữ liệu
        } else {
          console.log('No fields available');
        }
      },
      error: err => {
        console.error('Error fetching fields:', err);
      }
    });
  }
  
  fetchDashboardData() {
    console.log("fetchDashboardData called");
  
    this.todayRevenue = 0;  // Khởi tạo lại tổng doanh thu mỗi khi gọi hàm này
    this.totalBookings = 0; // Khởi tạo lại tổng số đặt sân
    this.todayActiveFieldCounts = 0;
    this.todayMaintenanceCount = 0;

    console.log('this.fields:', this.fields); // Kiểm tra giá trị của this.fields
  
    if (this.fields.length > 0) {
      const bookingCountRequests: Observable<any>[] = [];  // Khai báo kiểu rõ ràng
      const revenueRequests: Observable<any>[] = [];  // Khai báo kiểu rõ ràng
      const activeFieldRequests: Observable<any>[] = []; // Khai báo yêu cầu đếm số sân hoạt động
      const maintenanceFieldRequests: Observable<any>[] = []; // Khai báo yêu cầu đếm số sân bảo trì
      this.fields.forEach((field) => {
        console.log(`Fetching data for field: ${field.id}`);  // Kiểm tra xem có vào được vòng lặp không
  
        if (field.id !== undefined && field.id !== null) {
          const fieldIdStr = field.id.toString();
  
          // Thêm yêu cầu đếm số lượng đặt sân
          bookingCountRequests.push(
            this.bookingService.countBookingsByFieldToday(field.id).pipe(
              map((count: number) => {
                console.log(`Booking count for field ${field.id}:`, count);  // Kiểm tra dữ liệu trả về
                this.fieldBookingCounts[fieldIdStr] = count;
                this.totalBookings += count;  // Cộng dồn số đặt sân
                return count;
              })
            )
          );
  
          // Thêm yêu cầu tính doanh thu cho từng sân
          revenueRequests.push(
            this.bookingService.calculateRevenueByFieldToday(field.id).pipe(
              map((revenue: number) => {
                console.log(`Revenue for field ${field.id}:`, revenue);  // Kiểm tra dữ liệu trả về
                this.fieldRevenues[fieldIdStr] = revenue;
                this.todayRevenue += revenue;
                return revenue;
              })
            )
          );
               // Thêm yêu cầu đếm số lượng sân hoạt động
               activeFieldRequests.push(
                this.fieldService.countActiveSmallFields(field.id).pipe(
                  map((activeCount: number) => {
                    console.log(`Active count for field ${field.id}:`, activeCount);
                    this.activeFieldCounts[fieldIdStr] = activeCount;
                    this.todayActiveFieldCounts +=activeCount;
                    return activeCount;
                  })
                )
              );
    
              // Thêm yêu cầu đếm số lượng sân bảo trì
              maintenanceFieldRequests.push(
                this.fieldService.countMaintenanceSmallFields(field.id).pipe(
                  map((maintenanceCount: number) => {
                    console.log(`Maintenance count for field ${field.id}:`, maintenanceCount);
                    this.maintenanceFieldCounts[fieldIdStr] = maintenanceCount;
                    this.todayMaintenanceCount += maintenanceCount;
                    return maintenanceCount;
                  })
                )
              );
        } else {
          console.warn('field.id is undefined or null for field:', field);
        }
      });
  
      // Sử dụng forkJoin để chờ tất cả các API hoàn thành
      forkJoin([...bookingCountRequests, ...revenueRequests, ...activeFieldRequests, ...maintenanceFieldRequests]).subscribe(
        () => {
          console.log('API calls completed');
          console.log('fieldBookingCounts:', this.fieldBookingCounts);
          console.log('fieldRevenues:', this.fieldRevenues);
          console.log('Total revenue today:', this.todayRevenue);
          console.log('Total bookings today:', this.totalBookings);
  
          // Cập nhật biểu đồ sau khi dữ liệu được tải
          this.updateRevenueChartData();
        },
        (error) => {
          console.error('Error in fetching data:', error);
        }
      );
    } else {
      console.log('No fields to process');
    }
  }
  
  updateRevenueChartData() {
    if (!this.fields || this.fields.length === 0) {
      console.warn('No fields data available to update the chart');
      return;
    }
  
    const labels: string[] = []; // Tên các sân
    const activeFieldData: { [fieldName: string]: number } = {}; // Dữ liệu sân đang hoạt động theo tên sân
    const maintenanceFieldData: { [fieldName: string]: number } = {}; // Dữ liệu sân bảo trì theo tên sân
    const revenueData: { [fieldName: string]: number } = {};  // Dữ liệu doanh thu theo tên sân
  
    // Lặp qua từng sân và lấy thông tin doanh thu và trạng thái hoạt động/bảo trì
    this.fields.forEach((field) => {
      if (field.fieldName) {
        labels.push(field.fieldName); // Thêm tên sân vào nhãn
  
        // Lấy thông tin doanh thu từ fieldRevenues
        if (field.id && this.fieldRevenues[field.id.toString()] !== undefined) {
          revenueData[field.fieldName] = this.fieldRevenues[field.id.toString()];
        } else {
          console.warn(`Revenue data not found for field ID: ${field.id}`);
          revenueData[field.fieldName] = 0;
        }
  
        // Kiểm tra trạng thái hoạt động và bảo trì
        if (field.id) {
          const activeCount = this.activeFieldCounts[field.id.toString()] || 0;
          const maintenanceCount = this.maintenanceFieldCounts[field.id.toString()] || 0;
  
          activeFieldData[field.fieldName] = activeCount;
          maintenanceFieldData[field.fieldName] = maintenanceCount;
        }
      } else {
        console.warn(`fieldName is undefined or empty for field ID: ${field.id}`);
      }
    });
  
    // Cập nhật dữ liệu biểu đồ doanh thu (bar chart)
    this.revenueData = {
      labels: labels,
      datasets: [
        {
          label: 'Doanh thu hôm nay',
          data: labels.map((label) => revenueData[label]),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2E86C1',
          ]
        }
      ]
    };
  
    // Cập nhật dữ liệu biểu đồ sân (pie chart) với Sân Đang Hoạt Động và Sân Bảo Trì
    this.fieldStatusData = {
      labels: labels,
      datasets: [
        {
          label: 'Sân đang hoạt động',
          data: labels.map((label) => activeFieldData[label]),
          backgroundColor: '#4BC0C0', // Màu sắc cho sân đang hoạt động
        },
        {
          label: 'Sân bảo trì',
          data: labels.map((label) => maintenanceFieldData[label]),
          backgroundColor: '#FFCE56', // Màu sắc cho sân bảo trì
        }
      ]
    };
  
    // Log dữ liệu của các biểu đồ
    console.log('Revenue chart data updated:', this.revenueData);
    console.log('Field status chart data updated:', this.fieldStatusData);
  }
  prepareChartData(): void {
  // Kiểm tra dữ liệu người dùng và sân
  const activeUsers = this.activeUsers || 0;
  const inactiveUsers = this.inactiveUsers || 0;
  const activeFields = this.activeFields || 0;
  const inactiveFields = this.inactiveFields || 0;

  // Cập nhật dữ liệu biểu đồ người dùng
  this.userChartData = {
    labels: ['Người dùng đang hoạt động', 'Người dùng không hoạt động'],
    datasets: [
      {
        label: 'Thống kê người dùng',
        data: [activeUsers, inactiveUsers], // Dữ liệu cho cả hai trạng thái người dùng
        backgroundColor: ['#36A2EB', '#FF6384'] // Màu sắc cho mỗi trạng thái
      }
    ]
  };

  // Cập nhật dữ liệu biểu đồ sân
  this.fieldChartData = {
    labels: ['Sân đang hoạt động', 'Sân ngừng hoạt động'],
    datasets: [
      {
        label: 'Thống kê sân',
        data: [activeFields, inactiveFields], // Dữ liệu cho cả hai trạng thái sân
        backgroundColor: ['#4BC0C0', '#FFCE56'] // Màu sắc cho mỗi trạng thái
      }
    ]
  };

  // Log dữ liệu để kiểm tra
  console.log('User Chart Data:', this.userChartData);
  console.log('Field Chart Data:', this.fieldChartData);
}

  
  
  


}
