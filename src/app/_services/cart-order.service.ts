import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderItem, OrderStatus } from '../model/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartOrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl + '/list');
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/findById?id=${id}`);
  }

  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status?status=${status}`, null);
  }

  getOrderItems(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/orderItems?orderId=${orderId}`);
  }

  getOrderStatusHistory(orderId: number): Observable<{ status: OrderStatus; timestamp: Date; note?: string }[]> {
    return this.http.get<{ status: OrderStatus; timestamp: Date; note?: string }[]>(`${this.apiUrl}/${orderId}/status-history`);
  }
}
