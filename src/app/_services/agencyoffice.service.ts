import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../_services/hvnhconst';
const API_USER_URL = API_PATH + '/agencyoffice/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class AgencyOfficeService {
  private baseURL = API_USER_URL;
  constructor(private http: HttpClient) { }

  getPageAgencyOffice(
    page: number,
    agencycode?: string,
    brcd?: string,
    companycode?: string
  ): Observable<any> {
    return this.http.post<any>(
      this.baseURL + 'searchAgencyOffice',
      {
        page,
        agencycode,
        brcd,
        companycode,
      },
      httpOptions
    );
  }

  exportExcel(agencycode?: string, brcd?: string, companycode?: string): Observable<any> {
    return this.http.get<any>(this.baseURL + 'export-excel?agencycode=' + agencycode + '&brcd='
      + brcd + '&companycode=' + companycode, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  add(
    id: number,
    agencycode: string,
    agencyname: string,
    brcd: string,
    brcdname: string,
    companycode: string,
    companyname: string,
    sts: string,
    createdDate?: Date,
    createdby?: string
  ) {
    return this.http.post(
      this.baseURL + 'saveOrUpdate',
      {
        id,
        agencycode,
        agencyname,
        brcd,
        brcdname,
        companycode,
        companyname,
        sts, createdDate, createdby
      },
      httpOptions
    );
  }

  delete(id?: number): Observable<any> {
    return this.http.get(this.baseURL + 'delete?id=' + id, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findbyid?id=' + id, httpOptions);
  }
}
