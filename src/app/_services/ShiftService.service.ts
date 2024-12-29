import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private shiftSubject = new BehaviorSubject<any>(null);
  shift$ = this.shiftSubject.asObservable();

  sendShift(shiftData: any) {
    this.shiftSubject.next(shiftData);
  }
}
