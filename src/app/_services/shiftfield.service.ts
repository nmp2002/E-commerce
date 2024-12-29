import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from "../_services/hvnhconst";
import { TblShiftField} from "../model/tblShiftField";

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
export class ShiftFieldService {

    private baseURL = API_PATH + '/shiftfield/';

    constructor(private http: HttpClient) { }

    saveShiftField(id: number,
      fieldId: number,
        shiftFieldName: number,
        createdBy: string,
        createdDate: Date,
        modifiedDate: Date,
        modifiedBy: string,
        timeStart: string,
        timeEnd: string,
        amountWeekday: string,
        amountWeekend: string,
        dayOfWeek: string,
        day: Date,
        statusField: string, fieldType: string): Observable<any> {
        return this.http.put(this.baseURL + 'addShiftField', {
            id,
            fieldId,
            shiftFieldName,
            createdBy,
            createdDate,
            modifiedDate,
            modifiedBy,
            timeStart,
            timeEnd,
            amountWeekday,
            amountWeekend,
            dayOfWeek,
            day,
            statusField,
            fieldType
        }, httpOptions);
    }

    getShiftFieldsByFieldId(fieldId: number): Observable<TblShiftField[]> {
      return this.http.get<TblShiftField[]>(`${this.baseURL}getshiftfield?fieldId=${fieldId}`, httpOptions);
  }
  getShiftFieldsByFieldType(fieldId: number, fieldType: string): Observable<TblShiftField[]> {
    let params = new HttpParams().set('fieldId', fieldId.toString()).set('fieldType', fieldType);
    return this.http.get<TblShiftField[]>(`${this.baseURL}getshiftfieldsbytype`, { params, headers: httpOptions.headers });
  }
  // Phương thức mới để cập nhật shift field
  updateShiftField(id: number,
    fieldId: number,
    shiftFieldName:number,
    createdBy: string,
    createdDate: Date,
    modifiedDate: Date,
    modifiedBy: string,
    timeStart: string,
    timeEnd: string,
    amountWeekday: string,
    amountWeekend: string,
    dayOfWeek: string,
    day: Date,
    statusField: string,
    fieldType: string): Observable<any> {
    return this.http.put(this.baseURL + 'updateShiftField', {
      id,
      fieldId,
      shiftFieldName,
      createdBy,
      createdDate,
      modifiedDate,
      modifiedBy,
      timeStart,
      timeEnd,
      amountWeekday,
      amountWeekend,
      dayOfWeek,
      day,
      statusField,
      fieldType
    }, httpOptions);
  }
}