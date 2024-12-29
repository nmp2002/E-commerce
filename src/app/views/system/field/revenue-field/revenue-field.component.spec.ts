import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueFieldComponent  } from './revenue-field.component';

describe('FieldCreateComponent', () => {
  let component: RevenueFieldComponent ;
  let fixture: ComponentFixture<RevenueFieldComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevenueFieldComponent  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueFieldComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
