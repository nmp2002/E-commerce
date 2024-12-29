import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TblMenuBtn } from "../model/tblMenuBtn";
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
export class TblMenuBtnService {
  private baseURL = API_PATH + '/menu/btn/';
  constructor(private http: HttpClient) { }

  findAll(): Observable<TblMenuBtn[]> {
    return this.http.get<TblMenuBtn[]>(this.baseURL, httpOptions);
  }

  findBtnByMenuIdToJson(menuId: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findBtnByMenuIdToJson?menuId=' + menuId, httpOptions);
  }

  getPageMenuBtn(page: number, size: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'paging?page=' + page + '&size=' + size, httpOptions);
  }

  findMenuBtn(btnName: string, btnCode: string, menuId: number,
    status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'list', {
      btnName, btnCode, menuId, status, page, size
    }, httpOptions);
  }

  createOrUpdateMenuBtn(id: number, menuId: number, btnCode: string, btnName: string,
    status: string, description: string, icon: string, isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateMenuBtn' : 'createMenuBtn'), {
      id, btnName, btnCode, menuId, status, description, icon
    }, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?id=' + id, httpOptions);
  }

  deleteMenuBtn(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?id=' + id, httpOptions);
  }

  lockMenuBtn(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'lock?id=' + id, httpOptions);
  }

  unlockMenuBtn(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'unlock?id=' + id, httpOptions);
  }
}
