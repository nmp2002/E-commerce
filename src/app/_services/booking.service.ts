import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from "../_services/hvnhconst";
import { TblBooking } from '../model/tblBooking';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    "Access-Control-Allow-Origin": "*"
  })
};

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  [x: string]: any;
  private baseURL = API_PATH + '/booking/';

  constructor(private http: HttpClient) { }
   // Định dạng ngày theo "dd-MMM-yy"
   private formatDateToDDMMMYY(date: Date): string {
    const options = {
      year: '2-digit',
      month: 'short',
      day: '2-digit',
    } as const;
    return date
      .toLocaleDateString('en-GB', options) // Định dạng chuẩn Anh (dd-MMM-yy)
      .replace(/ /g, '-') // Thay khoảng trắng bằng gạch ngang
      .toUpperCase(); // Chuyển toàn bộ thành chữ hoa
  }
  // Method to save or update booking
  saveOrUpdateBooking(   bookingId: number,
    fieldId: number,
    guestId: number,
    shiftFieldId: number,
    smallFieldId:number,
    nameField: string,
    smallFieldName:string,
    nameGuest: string,
    phoneNumberGuest: string,
    totalPayment: string,
    timeStart: string,
    day: Date,
    timeEnd: string,
    statusField: string,
    paymentStatus: string,
    fieldType: string,
    createdDate: Date,
    createdBy: string,
    modifiedDate: Date,
    modifiedBy: string): Observable<any> {
    return this.http.put(this.baseURL +'savebooking', {
      bookingId,
      fieldId,
      guestId,
      shiftFieldId,
      smallFieldId,
      nameField,
      smallFieldName,
      nameGuest,
      phoneNumberGuest,
      totalPayment,
      timeStart,
      day,
      timeEnd,
      statusField,
      paymentStatus,
      fieldType,
      createdDate,
      createdBy,
      modifiedDate,
      modifiedBy
    }, httpOptions);
  }

  getBooking(nameField: string, smallFieldName:string, nameGuest: string, phoneNumberGuest: string,totalPayment: string, timeStart: string, timeEnd: string, day:Date, statusField: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'paging', {
      nameField,smallFieldName, nameGuest, phoneNumberGuest,totalPayment,timeStart,timeEnd,day, statusField, page, size
    }, httpOptions);
  
  }
  getBookingsBySmallFieldId(smallFieldId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'bookingid?smallFieldId=' + smallFieldId,httpOptions);
  }

  getBookingsByFieldId(fieldId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'bookingFieldId?fieldId=' + fieldId,httpOptions);
  }

  deleteBooking(bookingId: number): Observable<any>{
    return this.http.get<any>(this.baseURL + 'deleteBooking?bookingId=' +bookingId,httpOptions);
  }

  getBookingbyId(bookingId: number): Observable<any>{
    return this.http.get<any>(this.baseURL + 'bookingId?bookingId=' + bookingId, httpOptions);
  }

   getWeeklyRevenueByFieldId(fieldId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'weekly-revenue?fieldId=' + fieldId, httpOptions);
  }

  getMonthlyRevenueByFieldId(fieldId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'monthly-revenue?fieldId=' + fieldId, httpOptions);
  }
  // Phương thức gọi API kiểm tra sự tồn tại của booking
  checkBookingExistence(smallFieldId: number, timeStart: string, day: string): Observable<boolean> {
    return this.http.get<any>(`${this.baseURL}checkExistence?smallFieldId=${smallFieldId}&timeStart=${timeStart}&day=${day}`, httpOptions);
  }
}
