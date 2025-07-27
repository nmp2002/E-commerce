import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from './hvnhconst';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    "Access-Control-Allow-Origin": "*"
  })
};

export interface OrderItem {
  id?: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createBy?: string;
  modifiedBy?: string;
  createdDate?: Date;
  modifiedDate?: Date;
}

export interface Order {
  id?: number;
  userId: number;
  totalAmount: number;
  status: number; // 0: pending, 1: confirmed, 2: shipped, 3: delivered, 4: cancelled
  shippingAddress: string;
  phone: string;
  email: string;
  orderDate: Date;
  createBy?: string;
  modifiedBy?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  items?: OrderItem[]; // Optional for API responses
}

export interface CreateOrderRequest {
  userId: number;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  email: string;
  orderItems: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface OrderResponse {
  id: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseURL = API_PATH + '/orders/';

  constructor(private http: HttpClient) { }

  // Tạo đơn hàng mới (PUT /api/orders/createOrder)
  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(this.baseURL + 'createOrder', orderData, httpOptions);
  }

  // Lấy đơn hàng theo ID (GET /api/orders/findById)
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(this.baseURL + 'findById?id=' + orderId, httpOptions);
  }

  // Cập nhật trạng thái đơn hàng (PUT /api/orders/updateOrderStatus)
  updateOrderStatus(orderId: number, status: number): Observable<any> {
    return this.http.put(this.baseURL + 'updateOrderStatus', null, {
      ...httpOptions,
      params: {
        orderId: orderId.toString(),
        status: status.toString()
      }
    });
  }

  // Lấy đơn hàng theo User ID (GET /api/orders/byUserId)
  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseURL + 'byUserId?userId=' + userId, httpOptions);
  }

  // Hủy đơn hàng (GET /api/orders/cancelOrder)
  cancelOrder(orderId: number): Observable<any> {
    return this.http.get(this.baseURL + 'cancelOrder?orderId=' + orderId, httpOptions);
  }

  // Lấy order items của đơn hàng (GET /api/orders/orderItems)
  getOrderItems(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(this.baseURL + 'orderItems?orderId=' + orderId, httpOptions);
  }

  // Lấy tổng tiền đơn hàng (GET /api/orders/totalAmount)
  getTotalAmount(orderId: number): Observable<number> {
    return this.http.get<number>(this.baseURL + 'totalAmount?orderId=' + orderId, httpOptions);
  }

  // Tìm kiếm đơn hàng (GET /api/orders/search)
  searchOrders(keyword: string): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseURL + 'search?keyword=' + encodeURIComponent(keyword), httpOptions);
  }

  // Lấy đơn hàng theo trạng thái (GET /api/orders/byStatus)
  getOrdersByStatus(status: number): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseURL + 'byStatus?status=' + status, httpOptions);
  }

  // Lấy đơn hàng theo User ID và trạng thái (GET /api/orders/byUserIdAndStatus)
  getOrdersByUserAndStatus(userId: number, status: number): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseURL + 'byUserIdAndStatus?userId=' + userId + '&status=' + status, httpOptions);
  }

  // Helper method để chuyển đổi status number thành string
  getStatusString(status: number): string {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'confirmed';
      case 2: return 'shipped';
      case 3: return 'delivered';
      case 4: return 'cancelled';
      default: return 'unknown';
    }
  }

  // Helper method để chuyển đổi status string thành number
  getStatusNumber(status: string): number {
    switch (status.toLowerCase()) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return 4;
      default: return 0;
    }
  }

  // Helper method để lấy tên trạng thái tiếng Việt
  getStatusVietnamese(status: number): string {
    switch (status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Đang giao hàng';
      case 3: return 'Đã giao hàng';
      case 4: return 'Đã hủy';
      default: return 'Không xác định';
    }
  }
}
