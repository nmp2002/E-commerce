import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from "../_services/hvnhconst";
import { TblField } from "../model/tblField";
import { TblCity } from '../model/tblCity';
import { TblSupplier } from '../model/TblSupplier';
import { TblSmallField } from '../model/tblSmallField';
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
export class FieldService {

  private baseURL = API_PATH + '/fields/';

  constructor(private http: HttpClient) { }

  findAll(): Observable<TblField[]> {
    return this.http.get<TblField[]>(`${this.baseURL}`);
  }

  // Lấy danh sách thành phố
  getCities(): Observable<TblCity[]> {
    return this.http.get<TblCity[]>(this.baseURL + 'cities', httpOptions);
   
  }

  getCityById(provinceid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}city?provinceid=${provinceid}`, httpOptions);
  }
  findById(provinceid: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?provinceid=' + provinceid, httpOptions);
  }

  // Lấy danh sách quận/huyện theo ID thành phố
  getDistrictsByCityId(provinceid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}districts?provinceid=${provinceid}`, httpOptions);
  }

  getSupplier() : Observable<TblSupplier[]> {
    return this.http.get<TblSupplier[]>(this.baseURL + 'suppliers', httpOptions);
   
  }

  // Lấy danh sách phường/xã theo ID quận/huyện/
  getWardsByDistrictId(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}wards?districtId=${districtId}`, httpOptions);
  }


  createOrUpdateField(  id: number,provinceid: number,districtId: number,wardId: number,
    fieldName: string,
    provinceName: string,
    districtName: string,
    wardName: string,
    fieldType: number,
    supplierId:number,
    supplierName:string,
    phoneNumberField: string,
    day: Date,
    timeStart: Date,
    timeEnd: Date,
    address: string,
    image: string,
    isUpdate: boolean): Observable<any> {
    return this.http.put(this.baseURL + (isUpdate ? 'updateField' : 'addField'), {
      id,
      provinceid,
      districtId,
      wardId,
      fieldName,
      provinceName,
      districtName,
      wardName,
      fieldType,
      supplierId,
      supplierName,
      phoneNumberField,
      day,
      timeStart,
      timeEnd,
      address,
      image

    }, httpOptions);
  }
  
  getFields(fieldName: string, districtName: string, provinceName: string,wardName: string, status: string, page: number, size: number): Observable<any> {
    return this.http.post<any>(this.baseURL + 'paging', {
      fieldName, districtName, provinceName,wardName, status, page, size
    }, httpOptions);
  
  }

  searchField(fieldName: string, districtName: string, provinceName: string, wardName: string, status: string, page: number, size: number): Observable<any>{
    return this.http.post<any>(this.baseURL + 'paging', {
      fieldName, districtName, provinceName,wardName, status, page, size
    }, httpOptions);
  }

  findField(fieldName:string,phoneNumberField:string  ,page: number, size: number): Observable<any>{
    return this.http.post<any>(this.baseURL + 'paging', {
      fieldName,phoneNumberField, page, size
    }, httpOptions);
  }
  deleteField(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'delete?id=' + id, httpOptions);
  }


  updateFieldStatus(id: number, status: number): Observable<any> {
    return this.http.put(`${this.baseURL}/${id}/status`, { status });
  }
  findAllField(page: number, size: number): Observable<any> {
    return this.http.get<any>( this.baseURL + 'list?page=' + page + '&size=' + size, httpOptions);
  }

  saveOrUpdateFieldType(fieldId: number, fieldTypeName: string, totalNumberField: number): Observable<any> {
    return this.http.put(this.baseURL+'fieldTypes',{fieldId,fieldTypeName,totalNumberField} , httpOptions);
  }

   // Lấy danh sách smallField theo ID field
   getSmallFieldsByFieldId(fieldId: number):  Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}smallFields?fieldId=${fieldId}`, httpOptions);
  }

  getSmallFieldById(id: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseURL}smallFieldId?id=${id}`, httpOptions);
  }

  updateField(id: number, fieldName: string, provinceName: string, districtName: string, wardName: string, phoneNumberField: string): Observable<any> {
    return this.http.put(this.baseURL + 'updateField', {
      id, fieldName, provinceName, districtName, wardName, phoneNumberField
    }, httpOptions);
  }

  getFieldsBySupplierId(supplierId: number, pageNumber: number, pageSize: number, fieldName?: string, phoneNumberField?: string): Observable<any> {
    let params: any = {
      supplierId: supplierId.toString(),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };

    if (fieldName) {
      params.fieldName = fieldName;
    }
    if (phoneNumberField) {
      params.phoneNumberField = phoneNumberField;
    }

    return this.http.get<any>(this.baseURL+'fieldsBySupplierId', { params });
  }

  getFieldTypebyFieldId(fieldId: number):  Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}fieldTypeByFieldId?fieldId=${fieldId}`, httpOptions);
  }

  findByIdField(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'findById?id=' + id, httpOptions);
  }


  lockField(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL+ 'lock?id=' + id, httpOptions);
  }

  unlockField(id: number): Observable<any> {
    return this.http.get<any>(this.baseURL + 'unlock?id=' + id, httpOptions);
  }
}
