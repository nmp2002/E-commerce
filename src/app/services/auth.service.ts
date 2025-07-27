import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signin`, { username, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, {
      username,
      email,
      password
    });
  }

  // Thêm phương thức đăng nhập bằng Google
  loginWithGoogle(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/google`);
  }

  // Lưu thông tin người dùng sau khi đăng nhập Google
  handleGoogleAuth(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google/callback`, { token });
  }
}
