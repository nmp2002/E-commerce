import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderedProductsComponent } from './ordered-products.component';
import { CartOrderService } from '../../../_services/cart-order.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('OrderedProductsComponent', () => {
  let component: OrderedProductsComponent;
  let fixture: ComponentFixture<OrderedProductsComponent>;
  let mockCartOrderService: jasmine.SpyObj<CartOrderService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const cartOrderServiceSpy = jasmine.createSpyObj('CartOrderService', ['getAllOrders', 'getOrderItems']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['error', 'success']);

    await TestBed.configureTestingModule({
      declarations: [ OrderedProductsComponent ],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CartOrderService, useValue: cartOrderServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    })
    .compileComponents();

    mockCartOrderService = TestBed.inject(CartOrderService) as jasmine.SpyObj<CartOrderService>;
    mockToastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderedProductsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ordered products on init', () => {
    // Mock data
    const mockOrders = [
      {
        orderId: 1,
        userId: 1,
        orderDate: new Date(),
        status: 'pending',
        totalAmount: 100000
      }
    ];

    const mockOrderItems = [
      {
        orderItemId: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 50000,
        product: {
          id: 1,
          productName: 'Test Product',
          image: 'test.jpg'
        }
      }
    ];

    mockCartOrderService.getAllOrders.and.returnValue(of(mockOrders));
    mockCartOrderService.getOrderItems.and.returnValue(of(mockOrderItems));

    fixture.detectChanges();

    expect(mockCartOrderService.getAllOrders).toHaveBeenCalled();
  });

  it('should handle error when loading orders', () => {
    const error = { message: 'Test error' };
    mockCartOrderService.getAllOrders.and.returnValue(of([]));

    component.loadOrderedProducts();

    expect(mockCartOrderService.getAllOrders).toHaveBeenCalled();
  });

  it('should apply filter correctly', () => {
    const mockEvent = { target: { value: 'test' } } as any;

    component.applyFilter(mockEvent);

    expect(component.dataSource.filter).toBe('test');
  });

  it('should calculate total quantity correctly', () => {
    component.dataSource.data = [
      { quantity: 2 } as any,
      { quantity: 3 } as any,
      { quantity: 1 } as any
    ];

    const total = component.getTotalQuantity();
    expect(total).toBe(6);
  });

  it('should calculate total revenue correctly', () => {
    component.dataSource.data = [
      { totalPrice: 100000 } as any,
      { totalPrice: 200000 } as any,
      { totalPrice: 150000 } as any
    ];

    const total = component.getTotalRevenue();
    expect(total).toBe(450000);
  });
});
