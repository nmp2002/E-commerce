import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenStorageService } from './token-storage.service';
import { API_PATH } from "../_services/hvnhconst";
import { Router } from '@angular/router';
const AUTH_API = API_PATH + '/auth/';

const API_USER_URL = API_PATH + '/user/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'false' })
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router,
    public jwtHelper: JwtHelperService) { }

  public isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    return !this.jwtHelper.isTokenExpired(token != null ? String(token) : '');
  }

  logOut(): void {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      username,
      password
    }, httpOptions);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username,
      email,
      password
    }, httpOptions);
  }


  createOrUpdateUser(id: number, username: string, email: string, password: string, fullname: string, address: string,
    telephone: string, departmentcode: string, departmentname: string, roleId: number, officecode: string,
    officename: string, officetype: string, lstPermission: string, isUpdate: boolean): Observable<any> {
    return this.http.put(API_USER_URL + (isUpdate ? 'updateUser' : 'registerUser'), {
      id,
      username,
      email,
      password,
      fullname,
      address,
      telephone,
      departmentcode,
      departmentname,
      roleId,
      officecode,
      officename,
      officetype,
      lstPermission
    }, httpOptions);
  }
}
