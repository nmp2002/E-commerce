import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    "Access-Control-Allow-Origin": "*"

  })
};
export interface ProductAttribute {
  id?: number;
  productId: number;
  attributeName: string;
  attributeValue: string;
  createby?: string;
  modifiedby?: string;
  createdDate?: Date;
  modifiedDate?: Date;
}

@Injectable({ providedIn: 'root' })
export class ProductAttributeService {
  private apiUrl = 'http://localhost:8080/api/product-attributes';

  constructor(private http: HttpClient) {}

  create(attribute: ProductAttribute): Observable<ProductAttribute> {
    return this.http.post<ProductAttribute>(this.apiUrl, attribute, httpOptions);
  }

  update(id: number, attribute: ProductAttribute): Observable<ProductAttribute> {
    return this.http.put<ProductAttribute>(`${this.apiUrl}/${id}`, attribute, httpOptions);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, httpOptions);
  }

  getById(id: number): Observable<ProductAttribute> {
    return this.http.get<ProductAttribute>(`${this.apiUrl}/${id}`, httpOptions);
  }

  getByProductId(productId: number): Observable<ProductAttribute[]> {
    return this.http.get<ProductAttribute[]>(`${this.apiUrl}/product/${productId}`, httpOptions);
  }

  getAll(): Observable<ProductAttribute[]> {
    return this.http.get<ProductAttribute[]>(this.apiUrl, httpOptions);
  }
}
