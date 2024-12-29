import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_PATH } from "../_services/hvnhconst";
import { Notification } from '../model/notificationdto';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
const API_URL = API_PATH + '/category/notification/';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) { }
  getNotification(): Observable<any> {
    return this.http.get<Notification>(API_URL + 'getNotification', httpOptions);
  }

  findNotification(title: string, content: string, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(API_URL + 'list', {
      title, content, status, page, size
    }, httpOptions);
  }

  createOrUpdateNotification(id: number, title: string, content: string, startdate: Date, endate: string, status: string, isUpdate: boolean): Observable<any> {
    return this.http.put(API_URL + (isUpdate ? 'updateNotification' : 'createNotification'), {
      id, title, content, status, startdate, endate
    }, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(API_URL + 'findById?id=' + id, httpOptions);
  }
}
