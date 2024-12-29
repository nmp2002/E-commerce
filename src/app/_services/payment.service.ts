import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_PATH } from '../_services/hvnhconst';

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
export class PaymentService {
    private baseURL = API_PATH + '/payment/';

    constructor(private http: HttpClient) { }

    createPayment(bookingId: number, amount: number): Observable<string> {
        const params = new HttpParams()
            .set('bookingId', bookingId.toString())
            .set('amount', amount.toString());

        return this.http.get(this.baseURL + 'createPayment', {
            ...httpOptions,
            params,
            responseType: 'text'  
        });
    }   

      // Hàm vnpayReturn để gửi các tham số trả về từ VNPay đến backend
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

}
