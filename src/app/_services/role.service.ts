import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TblRole } from "../model/tblRole";
import { API_PATH } from "../_services/hvnhconst";
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
export class TblRoleService {
  private baseURL = API_PATH + '/role/';
  constructor(private http: HttpClient) { }

  findAll(): Observable<TblRole[]> {
    return this.http.get<TblRole[]>(this.baseURL, httpOptions);
  }

  getPageRole(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findRole(roleName: string, roleCode: string, groupRoleId: number, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      roleName, roleCode, groupRoleId, status, page, size
    }, httpOptions);
  }

  createOrUpdateRole(id: number, roleCode: string, roleName: string, groupRoleId: number, status: string, description: string, isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateRole' : 'createRole'), {
      id, roleCode, roleName, groupRoleId, status, description
    }, httpOptions);
  }

  findById(roleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?roleId=' + roleId, httpOptions);
  }

  deleteRole(roleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?roleId=' + roleId, httpOptions);
  }

  lockRole(roleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'lock?roleId=' + roleId, httpOptions);
  }
}
