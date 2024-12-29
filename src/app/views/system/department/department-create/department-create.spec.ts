import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentCreateComponent } from './department-create.component';

describe('DepartmentCreateComponent', () => {
  let component: DepartmentCreateComponent;
  let fixture: ComponentFixture<DepartmentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
