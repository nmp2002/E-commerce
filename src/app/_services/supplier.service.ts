import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../_services/hvnhconst';
import { TblSupplier } from '../model/TblSupplier';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseURL = API_PATH + '/supplier/';

  constructor(private http: HttpClient) {}

  // Thêm phương thức để lấy TblSupplier theo supplierNameLogin
  getSupplierBySupplierNameLogin(supplierNameLogin: string): Observable<TblSupplier> {
    return this.http.get<TblSupplier>(this.baseURL + 'by-name-login', {
      params: new HttpParams().set('supplierNameLogin', supplierNameLogin),
      ...httpOptions
    });
  }
}
