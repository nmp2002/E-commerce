import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserChangePassComponent } from './user-change-pass.component';

describe('UserChangePassComponent', () => {
  let component: UserChangePassComponent;
  let fixture: ComponentFixture<UserChangePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserChangePassComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserChangePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
