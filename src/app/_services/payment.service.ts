import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_PATH } from '../_services/hvnhconst';
import { tblNotification } from '../model/tblNotification';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      "Access-Control-Allow-Origin": "*"
    })
};

export interface PaymentStatusResponse {
    message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
    private baseURL = API_PATH + '/order-payment/';

    constructor(private http: HttpClient) { }

    /**
     * Tạo URL thanh toán VNPay cho đơn hàng
     * Hỗ trợ cả orderId và bookingId (tương thích ngược)
     */
    createPayment(orderId: number, amount: number, bookingId?: number): Observable<string> {
        let params = new HttpParams()
            .set('amount', amount.toString());

        // Ưu tiên orderId, nếu không có thì dùng bookingId
        if (orderId) {
            params = params.set('orderId', orderId.toString());
        } else if (bookingId) {
            params = params.set('bookingId', bookingId.toString());
        }

        return this.http.get(this.baseURL + 'createPayment', {
            ...httpOptions,
            params,
            responseType: 'text'
        }).pipe(
            catchError(error => {
                console.error('Failed to create payment URL:', error);
                throw error;
            })
        );
    }

    /**
     * Xử lý callback từ VNPay sau khi thanh toán
     */
    vnpayReturn(vnpParams: any): Observable<string> {
        return this.http.post(this.baseURL + 'vnpay-return', vnpParams, {
            ...httpOptions,
            responseType: 'text'
        }).pipe(
            catchError(error => {
                console.error('Payment verification failed:', error);
                throw error;
            })
        );
    }

    /**
     * Lấy thông báo thanh toán
     */
    getNotification(fieldId: number): Observable<tblNotification[]> {
        return this.http.get<tblNotification[]>(`${this.baseURL}notification?fieldId=${fieldId}`, httpOptions).pipe(
            catchError(error => {
                console.error('Failed to get notifications:', error);
                throw error;
            })
        );
    }

    /**
     * Kiểm tra trạng thái thanh toán của đơn hàng
     * Hỗ trợ cả orderId và bookingId (tương thích ngược)
     */
    checkPaymentStatus(orderId?: number, bookingId?: number): Observable<PaymentStatusResponse> {
        let params = new HttpParams();

        // Ưu tiên orderId, nếu không có thì dùng bookingId
        if (orderId) {
            params = params.set('orderId', orderId.toString());
        } else if (bookingId) {
            params = params.set('bookingId', bookingId.toString());
        }

        return this.http.get<PaymentStatusResponse>(this.baseURL + 'checkPaymentStatus', {
            ...httpOptions,
            params
        }).pipe(
            catchError(error => {
                console.error('Failed to check payment status:', error);
                throw error;
            })
        );
    }
}
