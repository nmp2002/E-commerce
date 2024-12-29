import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRoleCreateComponent } from './groupRole-create.component';

describe('DepartmentCreateComponent', () => {
  let component: GroupRoleCreateComponent;
  let fixture: ComponentFixture<GroupRoleCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupRoleCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupRoleCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
