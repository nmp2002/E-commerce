import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupRole } from "../model/GroupRole";
import { TblMenu } from '../model/tblMenu';
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
export class GroupRoleService {
  /*
 * Doanhtd
  */
  private baseURL = API_PATH + '/groupRole/';
  constructor(
    private http: HttpClient
  ) {
  }
  findAll(): Observable<GroupRole[]> {
    return this.http.get<GroupRole[]>(this.baseURL, httpOptions);
  }

  getPageGroupRole(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findGroupRole(groupRoleName: string, groupRoleCode: string, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      groupRoleName, groupRoleCode, status, page, size
    }, httpOptions);
  }

  createOrUpdateGroupRole(id: number, groupRoleCode: string, groupRoleName: string, status: string, description: string, groupPermission: string, isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateGroupRole' : 'createGroupRole'), {
      id, groupRoleCode, groupRoleName, status, description, groupPermission
    }, httpOptions);
  }

  findById(groupRoleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?groupRoleId=' + groupRoleId, httpOptions);
  }

  deleteGroupRole(groupRoleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?groupRoleId=' + groupRoleId, httpOptions);
  }

  lockGroupRole(groupRoleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'lock?groupRoleId=' + groupRoleId, httpOptions);
  }
}
