import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  SmallFieldComponent } from './smallField.component';

describe('  SmallFieldComponent ', () => {
  let component:   SmallFieldComponent ;
  let fixture: ComponentFixture<  SmallFieldComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [  SmallFieldComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(  SmallFieldComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
