import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TblDepartment } from "../model/TblDepartment";
import { API_PATH } from "../_services/hvnhconst";
import { Objcbb } from "./../model/objcbb";

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
export class TblDepartmentService {
  /*
 * Doanhtd
  */
  private baseURL = API_PATH + '/department/';
  constructor(private http: HttpClient) { }

  findAll(): Observable<TblDepartment[]> {
    return this.http.get<TblDepartment[]>(this.baseURL, httpOptions);
  }

  getPageDepartment(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findDepartment(departmentName: string, departmentCode: string, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      departmentName, departmentCode, status, page, size
    }, httpOptions);
  }

  createOrupdateDepartment(id: number, pId: number, departmentCode: string, departmentName: string, status: string, description: string, isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateDepartment' : 'createDepartment'), {
      id, pId, departmentCode, departmentName, description, status
    }, httpOptions);
  }

  findById(deptId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?deptId=' + deptId, httpOptions);
  }

  deleteDepartment(deptId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?deptId=' + deptId, httpOptions);
  }

  lockDepartment(deptId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'lock?deptId=' + deptId, httpOptions);
  }

  findalldepartmentcbb(): Observable<any> {
    return this.http.get<Objcbb[]>(
      this.baseURL + 'getallcbb',
      httpOptions
    );
  }
}
