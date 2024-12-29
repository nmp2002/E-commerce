import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from "../_services/hvnhconst";
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const API_URL = API_PATH + '/user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getPageUser(page: number, size: number): Observable<any> {
    return this.http.post<any>(API_URL + 'paging', {
      page, size
    }, httpOptions);
  }

  searchUser(userName: string, fullname: string, departmentname: string, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(API_URL + 'paging', {
      userName, fullname, departmentname, status, page, size
    }, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(API_URL + 'findById?id=' + id, httpOptions);
  }

  deleteUser(userName: string): Observable<any> {
    return this.http.get<any>(API_URL + 'delete?userName=' + userName, httpOptions);
  }

  

  lockUser(userName: string): Observable<any> {
    return this.http.get<any>(API_URL + 'lock?userName=' + userName, httpOptions);
  }

  unlockUser(userName: string): Observable<any> {
    return this.http.get<any>(API_URL + 'unlock?userName=' + userName, httpOptions);
  }

  updateUser(id: number, email: string, fullname: string, address: string, telephone: string, departmentcode: string, departmentname: string, roleId: number,
    officecode: string, officename: string): Observable<any> {
    return this.http.put(API_URL + 'updateUser', {
      id, email, fullname, address, telephone, departmentcode, departmentname, roleId,
      officecode, officename
    }, httpOptions);
  }

  uploadAvatar(id: number, base64Data: string): Observable<any> {
    return this.http.put(API_URL + 'uploadAvatar', {
      id, base64Data
    }, httpOptions);
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.put(API_URL + 'changePassword', { id, password}, httpOptions);
  }

  getAllPassengerData(page: number): Observable<any> {
    return this.http.post(API_URL + 'admin', {
      page
    }, httpOptions);
  }

  findAllUser(page: number, size: number): Observable<any> {
    return this.http.get<any>(API_URL + 'list?page=' + page + '&size=' + size, httpOptions);
  }

  findAllUserPost(page: number, size: number): Observable<any> {
    return this.http.post<any>(API_URL + 'list1', {
      page, size
    }, httpOptions);
  }

  findUserPost(userName: string, email: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(API_URL + 'finduser', {
      userName, email, page, size
    }, httpOptions);
  }

}
