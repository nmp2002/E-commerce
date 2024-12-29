import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TblMenu } from "../model/tblMenu";
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
export class TblMenuService {
  private baseURL = API_PATH + '/menu/';
  constructor(
    private http: HttpClient
  ) {
  }
  findAll(): Observable<TblMenu[]> {
    return this.http.get<TblMenu[]>(this.baseURL, httpOptions);
  }

  findAllToJson(groupRoleId: number, roleId: number, isGetAll: boolean): Observable<any> {
    return this.http.get<any>(this.baseURL + 'json?groupRoleId=' + groupRoleId + '&roleId=' + roleId + '&isGetAll=' + isGetAll, httpOptions);
  }

  findMenuByGroupRoleToJson(groupRoleId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findMenuByGroupRoleToJson?groupRoleId=' + groupRoleId, httpOptions);
  }

  getPageMenu(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findMenu(menuName: string, menuCode: string, parentId: number, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      menuName, menuCode, parentId, status, page, size
    }, httpOptions);
  }

  createOrupdateMenu(menuId: number, menuCode: string, menuName: string, parentId: number, status: string, description: string,
    icon: string, url: string, color: string, text: string, orderNumber: number, title: string, isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateMenu' : 'createMenu'), {
      menuId, menuCode, menuName, parentId, status, description, icon, url, color, text, orderNumber, title
    }, httpOptions);
  }

  findById(menuId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?menuId=' + menuId, httpOptions);
  }

  deleteMenu(menuId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?menuId=' + menuId, httpOptions);
  }

  lockMenu(menuId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'lock?menuId=' + menuId, httpOptions);
  }

  configPermission(roleId: number, roleGroupId: number, arrMenu: string): Observable<any> {
    return this.http.put(this.baseURL + 'configPermission', {
      roleId, roleGroupId, arrMenu
    }, httpOptions);
  }

  getLstMenuByObjectId(objectId: number, objectType: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'getLstMenuByObjectId?objectId=' + objectId + "&objectType=" + objectType, httpOptions);
  }
}
