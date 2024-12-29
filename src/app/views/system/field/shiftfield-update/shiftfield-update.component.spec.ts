
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftFieldUpdateComponent } from './shiftfield-update.component';

describe('ShiftFieldUpdateComponent', () => {
  let component:  ShiftFieldUpdateComponent;
  let fixture: ComponentFixture< ShiftFieldUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftFieldUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent( ShiftFieldUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

