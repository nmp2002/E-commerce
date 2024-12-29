import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TblActionLog } from "../model/TblActionLog";
import { API_PATH } from "./hvnhconst";
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
export class TblActionLogService {
  private baseURL = API_PATH + '/actionLog/';
  constructor(private http: HttpClient) { }

  findAll(): Observable<TblActionLog[]> {
    return this.http.get<TblActionLog[]>(this.baseURL, httpOptions);
  }

  getPageActionLog(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findActionLog(tableName: string, columnName: string, columnId: number, actionType: string,
    previous: string, next: string, fromDate: Date, toDate: Date, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      tableName, columnName, columnId, actionType, previous, next, fromDate, toDate, status, page, size
    }, httpOptions);
  }

  exportExcel(tableName: string, columnName: string, columnId: number, actionType: string,
    previous: string, next: string, fromDate: string, toDate: string): Observable<any> {
    return this.http.get<any>(this.baseURL + 'export-excel?tableName=' + tableName + '&columnName=' 
    + columnName + '&columnId=' + columnId + '&actionType=' + actionType  
    + '&previous=' + previous + '&next=' + next + '&fromDate=' + fromDate + '&toDate=' + toDate, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
}
