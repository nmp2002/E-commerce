import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantDetailsModalComponent } from './variant-details-modal.component';

describe('VariantDetailsModalComponent', () => {
  let component: VariantDetailsModalComponent;
  let fixture: ComponentFixture<VariantDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariantDetailsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
