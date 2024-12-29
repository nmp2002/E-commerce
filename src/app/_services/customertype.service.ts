import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../_services/hvnhconst';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
const API_URL = API_PATH + '/customer/';
@Injectable({
  providedIn: 'root',
})
export class CustomertypeService {
  constructor(private http: HttpClient) {}

  createCustomertype(
    id: number,
    isdefault: string,
    iselement: string,
    typename: string,
    typenameen: string,
    createdate: Date,
    active: string,
    code: string,
    createdDate?: Date,
    createdby?: string
  ): Observable<any> {
    return this.http.post(
      API_URL + 'createcustomertype',
      {
        id,
        isdefault,
        iselement,
        typename,
        typenameen,
        createdate,
        active,
        code,
        createdDate,
        createdby
      },
      httpOptions
    );
  }

  getPageCustomertype(
    page: number,
    code?: string,
    typename?: string,
    typenameen?: string,
    active?: string
  ): Observable<any> {
    return this.http.post<any>(
      API_URL + 'getAllCustomertype',
      {
        page,
        code,
        typename,
        typenameen,
        active,
      },
      httpOptions
    );
  }

  deleteCustomertype(id?: number): Observable<any> {
    return this.http.get(API_URL + 'deleteCustomertype?id=' + id, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(API_URL + 'findtypebyid?id=' + id, httpOptions);
  }
}
