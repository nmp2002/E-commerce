import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductReview } from '../model/review.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  getProductReviews(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`${this.apiUrl}/product/${productId}`);
  }

  getUserReviews(userId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`${this.apiUrl}/user/${userId}`);
  }

  createReview(review: Omit<ProductReview, 'reviewId' | 'createdAt'>): Observable<ProductReview> {
    return this.http.post<ProductReview>(this.apiUrl, review);
  }

  updateReview(reviewId: number, review: Partial<ProductReview>): Observable<ProductReview> {
    return this.http.put<ProductReview>(`${this.apiUrl}/${reviewId}`, review);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  getAverageRating(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/product/${productId}/average-rating`);
  }
}
