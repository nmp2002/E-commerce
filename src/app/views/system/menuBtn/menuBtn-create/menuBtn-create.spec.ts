import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBtnCreateComponent } from './menuBtn-create.component';

describe('MenuBtnCreateComponent', () => {
  let component: MenuBtnCreateComponent;
  let fixture: ComponentFixture<MenuBtnCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuBtnCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBtnCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
