import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFieldResultComponent  } from './search-field-result.component';

describe(' SearchFieldResultComponent ', () => {
  let component: SearchFieldResultComponent ;
  let fixture: ComponentFixture<SearchFieldResultComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchFieldResultComponent  ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFieldResultComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
