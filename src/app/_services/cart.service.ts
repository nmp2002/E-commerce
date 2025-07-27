import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../model/cart.model';
import { environment } from '../../environments/environment';
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
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private baseUrl = environment.apiUrl;

  private cartChangedSource = new BehaviorSubject<void>(undefined);
  cartChanged$ = this.cartChangedSource.asObservable();

  constructor(private http: HttpClient) { }

  notifyCartChanged() {
    this.cartChangedSource.next();
  }

  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`, httpOptions);
  }

  getCartItems(cartId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/items/${cartId}`, httpOptions);
  }

  addToCart(userId: number, productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/add`, null, {
      params: {
        userId: userId.toString(),
        productId: productId.toString(),
        quantity: quantity.toString()
      },
      ...httpOptions
    });
  }

  updateCartItem(cartId: number, cartItemId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/${cartId}/items/${cartItemId}`, {
      quantity
    }, httpOptions);
  }

  removeCartItem(cartId: number, cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartId}/items/${cartItemId}`, httpOptions);
  }

  clearCart(cartId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartId}/items`, httpOptions);
  }
}
