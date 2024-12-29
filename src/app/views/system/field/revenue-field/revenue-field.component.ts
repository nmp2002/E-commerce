import { Component, OnInit } from '@angular/core';
import { BookingService } from 'src/app/_services/booking.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SupplierService } from 'src/app/_services/supplier.service';
import { FieldService } from 'src/app/_services/field.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-revenue-field',
  templateUrl: './revenue-field.component.html',
  styleUrls: ['./revenue-field.component.scss'],
})
export class RevenueFieldComponent implements OnInit {
  fields: any[] = [];
  totalRevenue: { [key: number]: number } = {};
  weeklyRevenue: { [key: string]: number } = {}; // Thêm biến lưu trữ doanh thu cho từng ngày
  revenueChart: any;
  selectedFieldId: number | null = null;
  selectedFieldName: string | null = null;
  selectedPeriod: 'Day' | 'Month' | 'Year' = 'Month';
  supplierId: number | null = null;
  loading: boolean = false;
  revenueRadioGroup: FormGroup;
  selectedMonth: string;
  selectedWeek: string;
  totalWeeklyRevenue: number = 0;
  totalMonthlyRevenue: number = 0;
  totalYearlyRevenue: number = 0;

  constructor(
    private bookingService: BookingService,
    private tokenStorageService: TokenStorageService,
    private supplierService: SupplierService,
    private fieldService: FieldService,
    private fb: FormBuilder
  ) {
    this.revenueRadioGroup = this.fb.group({
      revenueRadio: ['Month'],
    });
  }

  ngOnInit(): void {
    this.loadSupplierIdAndFields();
  }

  loadSupplierIdAndFields(): void {
    const currentUser = this.tokenStorageService.getUser();
    const username = currentUser ? currentUser.username : null;

    if (username) {
      this.supplierService.getSupplierBySupplierNameLogin(username).subscribe(
        (supplier) => {
          this.supplierId = supplier ? supplier.supplierId ?? 0 : 0;
          if (this.supplierId) {
            this.loadFields();
          }
        },
        (error) => {
          console.error('Error fetching supplier info:', error);
        }
      );
    }
  }

  loadFields(): void {
    this.loading = true;
    this.fieldService
      .getFieldsBySupplierId(this.supplierId!, 0, 10, '', '')
      .subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            this.fields = data.filter(
              (field) => field && field.id !== null && field.id !== undefined
            );
          } else {
            this.fields = [];
          }
        },
        error: (err) => {
          console.error('Error fetching fields:', err);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  setRevenuePeriod(period: 'Day' | 'Month' | 'Year') {
    this.selectedPeriod = period;
    console.log(`Doanh thu hiển thị cho ${period}:`);
    if (period === 'Day') {
      console.log('Tổng doanh thu tuần:', this.totalWeeklyRevenue);
    } else if (period === 'Month') {
      console.log('Tổng doanh thu tháng:', this.totalMonthlyRevenue);
    } else if (period === 'Year') {
      console.log('Tổng doanh thu năm:', this.totalYearlyRevenue);
    }
    this.loadRevenueData();
  }

  selectField(field: any) {
    this.selectedFieldId = field.id;
    this.selectedFieldName = field.fieldName;
    this.loadRevenueData();
  }

  loadRevenueData() {
    if (this.selectedFieldId === null) return;

    if (this.selectedPeriod === 'Day') {
      this.loadWeeklyRevenueData(this.selectedFieldId); // Truyền selectedFieldId vào
    } else if (this.selectedPeriod === 'Month') {
      this.loadMonthlyRevenueData(this.selectedFieldId); // Truyền selectedFieldId vào
    } else if (this.selectedPeriod === 'Year') {
      this.loadYearlyRevenueData(this.selectedFieldId); // Truyền selectedFieldId vào
    }
  }

  convertWeekToDate(week: string): Date | null {
    // Tách năm và tuần từ định dạng 'YYYY-Www'
    const [year, weekNumber] = week.split('-W').map(Number);
    if (isNaN(year) || isNaN(weekNumber)) return null;

    // Tính ngày đầu tiên của tuần
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 1; // Đầu tuần là thứ 2

    // Tạo ngày tương ứng
    const firstDateOfWeek = new Date(
      firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd)
    );
    return firstDateOfWeek;
  }

  // Sử dụng hàm trong loadWeeklyRevenueData
  loadWeeklyRevenueData(fieldId: number) {
    if (!this.selectedWeek || !this.selectedFieldId) return;

    const startDate = this.convertWeekToDate(this.selectedWeek);
    if (!startDate) {
      console.error('Invalid date value for selectedWeek:', this.selectedWeek);
      return;
    }

    this.bookingService
      .getBookingsByFieldId(this.selectedFieldId)
      .subscribe((bookings) => {
        this.weeklyRevenue = {}; // Reset doanh thu tuần

        // Lấy danh sách 7 ngày của tuần đã chọn
        const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          return date.toISOString().split('T')[0]; // Định dạng ngày thành yyyy-MM-dd
        });

        console.log('Ngày trong tuần đã chọn:', daysOfWeek);

        // Lặp qua các booking và tính tổng doanh thu cho mỗi ngày
        bookings.forEach(
          (booking: { day: any; totalPayment: number | string }) => {
            const bookingDate = booking.day; // Giả sử 'day' là thuộc tính định dạng yyyy-MM-dd

            // Chuyển đổi totalPayment thành số
            const paymentAmount = Number(booking.totalPayment);

            if (!isNaN(paymentAmount) && daysOfWeek.includes(bookingDate)) {
              this.weeklyRevenue[bookingDate] =
                (this.weeklyRevenue[bookingDate] || 0) + paymentAmount;
            }
          }
        );

        console.log('Doanh thu theo từng ngày:', this.weeklyRevenue);

        // Tính tổng doanh thu của cả tuần
        const totalWeekRevenue = Object.values(this.weeklyRevenue).reduce(
          (acc, revenue) => acc + revenue,
          0
        );
        console.log('Tổng doanh thu cả tuần:', totalWeekRevenue);
        this.totalWeeklyRevenue = totalWeekRevenue; // Cập nhật tổng doanh thu tuần

        this.updateChartDataForWeek();
      });
  }

  loadMonthlyRevenueData(fieldId: number) {
    if (!this.selectedMonth || !this.selectedFieldId) return;

    const [year, month] = this.selectedMonth.split('-').map(Number);
    if (isNaN(year) || isNaN(month)) {
      console.error(
        'Invalid date value for selectedMonth:',
        this.selectedMonth
      );
      return;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      return date.toISOString().split('T')[0];
    });

    this.bookingService
      .getBookingsByFieldId(this.selectedFieldId)
      .subscribe((bookings) => {
        const monthlyRevenue: { [key: string]: number } = {};

        bookings.forEach(
          (booking: { day: string; totalPayment: number | string }) => {
            const bookingDate = booking.day;
            const paymentAmount = Number(booking.totalPayment);

            if (!isNaN(paymentAmount) && daysOfMonth.includes(bookingDate)) {
              monthlyRevenue[bookingDate] =
                (monthlyRevenue[bookingDate] || 0) + paymentAmount;
            }
          }
        );

        const totalMonthlyRevenue = Object.values(monthlyRevenue).reduce(
          (acc, revenue) => acc + revenue,
          0
        );
        console.log('Doanh thu hàng tháng:', monthlyRevenue);
        console.log('Tổng doanh thu tháng:', totalMonthlyRevenue);
        this.totalMonthlyRevenue = totalMonthlyRevenue; // Cập nhật tổng doanh thu tháng

        this.updateChartData({
          labels: Object.keys(monthlyRevenue),
          data: Object.values(monthlyRevenue),
        });
      });
  }

  loadYearlyRevenueData(fieldId: number) {
    if (!this.selectedFieldId) return;

    const currentYear = new Date().getFullYear();
    const monthsOfYear = Array.from(
      { length: 12 },
      (_, i) => `${currentYear}-${(i + 1).toString().padStart(2, '0')}`
    );

    this.bookingService
      .getBookingsByFieldId(this.selectedFieldId)
      .subscribe((bookings) => {
        const yearlyRevenue: { [key: string]: number } = {};

        bookings.forEach(
          (booking: { day: string; totalPayment: number | string }) => {
            const [year, month] = booking.day.split('-');
            const paymentAmount = Number(booking.totalPayment);

            if (!isNaN(paymentAmount) && year === currentYear.toString()) {
              const monthKey = `${year}-${month}`;
              yearlyRevenue[monthKey] =
                (yearlyRevenue[monthKey] || 0) + paymentAmount;
            }
          }
        );

        const totalYearlyRevenue = Object.values(yearlyRevenue).reduce(
          (acc, revenue) => acc + revenue,
          0
        );
        console.log('Doanh thu hàng năm:', yearlyRevenue);
        console.log('Tổng doanh thu năm:', totalYearlyRevenue);
        this.totalYearlyRevenue = totalYearlyRevenue; // Cập nhật tổng doanh thu năm

        this.updateChartData({
          labels: Object.keys(yearlyRevenue),
          data: Object.values(yearlyRevenue),
        });
      });
  }

  private updateChartData(data: { labels: string[]; data: number[] }): void {
    this.revenueChart = {
      data: {
        labels: data.labels,
        datasets: [
          {
            label: `Doanh thu (${this.selectedPeriod}) cho sân ${this.selectedFieldName}`,
            data: data.data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0,123,255,0.5)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
      type: 'line',
    };
  }

  private updateChartDataForWeek(): void {
    const labels = Object.keys(this.weeklyRevenue);
    const data = labels.map((label) => this.weeklyRevenue[label]);

    this.revenueChart = {
      data: {
        labels: labels,
        datasets: [
          {
            label: `Doanh thu theo tuần cho sân ${this.selectedFieldName}`,
            data: data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0,123,255,0.5)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
      type: 'line',
    };
  }

  getSelectedFieldName(): string {
    const selectedField = this.fields.find(
      (field) => field.id === this.selectedFieldId
    );
    return selectedField ? selectedField.fieldName : 'Chưa chọn sân';
  }
}
