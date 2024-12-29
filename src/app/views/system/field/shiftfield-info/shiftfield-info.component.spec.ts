
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftFieldInfoComponent } from './shiftfield-info.component';

describe('FieldCreateComponent', () => {
  let component:   ShiftFieldInfoComponent;
  let fixture: ComponentFixture<  ShiftFieldInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [  ShiftFieldInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(  ShiftFieldInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

