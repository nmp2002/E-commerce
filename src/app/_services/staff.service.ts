import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TtiStaff } from "../model/staffdto";
import { API_PATH } from "../_services/hvnhconst";
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const API_URL = API_PATH + '/staff/';

@Injectable({
  providedIn: 'root'
})

export class StaffSerivce {
  constructor(private http: HttpClient) { }

  findAllStaffbyDepcd(depcd: String): Observable<TtiStaff[]> {
    return this.http.get<TtiStaff[]>(API_URL + 'listStaffbyDepcd?depcd=' + depcd, httpOptions);
  }

  getPageStaff(
    page: number,
    active?: string,
    code?: string,
    name?: string,
    
  ): Observable<any> {
    return this.http.post<any>(
      API_URL + 'searchStaff',
      {
        page,
        active,
        name,
        code,
      },
      httpOptions
    );
  }

  export(active: any, code: any, name: any): Observable<any> {
    let search = '';
    if(active != null && active != ''){
      search+=('active=' + active);
    }
    if(code != null && code != ''){
      search+=('code=' + code);
    }
    if(name != null && name != ''){
      search+=('name=' + name);
    }
    if(search!=null && search !=''){
      search = '?'+search;
    }
    return this.http.get<any>(API_URL + 'export' + search, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  add(
    id?: number,
    code?: string,
    name?: string,
    active?: string,
    agencyCode?: string,
    agencyName?: string,
    departmentCode?: string,
    departmentName?: string,
    officeCode?: string,
    officeName?: string,
  ) {
    return this.http.post(
      API_URL + 'createStaff',
      {
        id,
        code,
        name,
        active,
        agencyCode,
        agencyName,
        departmentCode,
        departmentName,
        officeCode,
        officeName,
      },
      httpOptions
    );
  }

  update(
    id?: number,
    code?: string,
    name?: string,
    active?: string,
    agencyCode?: string,
    agencyName?: string,
    departmentCode?: string,
    departmentName?: string,
    officeCode?: string,
    officeName?: string,
    createdDate?: Date,
    createdby?: string
  ) {
    return this.http.post(
      API_URL + 'updateStaff',
      {
        id,
        code,
        name,
        active,
        agencyCode,
        agencyName,
        departmentCode,
        departmentName,
        officeCode,
        officeName,
        createdDate,
        createdby
      },
      httpOptions
    );
  }

  delete(id?: number): Observable<any> {
    return this.http.get(API_URL + 'deleteStaff?id=' + id, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(
      API_URL + 'findbyid?id=' + id,
      httpOptions
    );
  }
}