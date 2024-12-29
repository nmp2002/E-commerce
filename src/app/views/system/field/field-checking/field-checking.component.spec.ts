import { ComponentFixture, TestBed } from '@angular/core/testing';

import{FieldCheckingComponent} from '../field-checking/field-checking.component'

describe('FieldCreateComponent', () => {
  let component: FieldCheckingComponent;
  let fixture: ComponentFixture<FieldCheckingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldCheckingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldCheckingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
