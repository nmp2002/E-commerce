import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CartOrderService } from '../../../_services/cart-order.service';
import { ProductService } from '../../../_services/product.service';
import { UserService } from '../../../_services/user.service';
import { Order, OrderStatus } from '../../../model/order.model';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { map, switchMap, shareReplay, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface OrderedProduct {
  orderId: number;
  customerName: string;
  orderDate: Date;
  orderStatus: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  description: string;
}

@Component({
  selector: 'app-ordered-products',
  templateUrl: './ordered-products.component.html',
  styleUrls: ['./ordered-products.component.scss']
})
export class OrderedProductsComponent implements OnInit {
  displayedColumns: string[] = [
    'orderId',
    'customerName',
    'orderDate',
    'orderStatus',
    'productName',
    'category',
    'quantity',
    'unitPrice',
    'totalPrice',
    'description'
  ];
  dataSource = new MatTableDataSource<OrderedProduct>();
  loading = false;
  OrderStatus = OrderStatus;
  Math = Math; // Để sử dụng trong template

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private cartOrderService: CartOrderService,
    private productService: ProductService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadOrderedProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

    loadOrderedProducts(): void {
    console.log('=== START LOADING ===');
    this.loading = true;

    this.cartOrderService.getAllOrders().subscribe({
      next: (orders) => {
        console.log('Orders received:', orders);
        console.log('Number of orders:', orders.length);

        const orderItemRequests = orders.map(order =>
          this.cartOrderService.getOrderItems(order.id).pipe(
            map(items => ({ order, items }))
          )
        );

        console.log('Created orderItemRequests:', orderItemRequests.length);

        forkJoin(orderItemRequests).subscribe({
          next: (orderItemsResults) => {
            console.log('OrderItems results received:', orderItemsResults);
            console.log('Number of orderItems results:', orderItemsResults.length);

            // Collect all unique user IDs and product IDs
            const userIds = new Set<number>();
            const productIds = new Set<number>();
            const allItems: Array<{order: any, item: any}> = [];

            orderItemsResults.forEach(({ order, items }) => {
              userIds.add(order.userId);
              items.forEach(item => {
                productIds.add(item.productId);
                allItems.push({ order, item });
              });
            });

            console.log('Unique userIds:', Array.from(userIds));
            console.log('Unique productIds:', Array.from(productIds));
            console.log('Total items to process:', allItems.length);

            // Create cache for user and product requests
            const userCache = new Map<number, Observable<any>>();
            const productCache = new Map<number, Observable<any>>();

            // Prepare user requests (with caching)
            userIds.forEach(userId => {
              userCache.set(userId, this.userService.findById(userId).pipe(
                catchError(error => {
                  console.error(`Error fetching user ${userId}:`, error);
                  return of(null);
                }),
                shareReplay(1)
              ));
            });

            // Prepare product requests (with caching)
            productIds.forEach(productId => {
              productCache.set(productId, this.productService.getProductById(productId).pipe(
                catchError(error => {
                  console.error(`Error fetching product ${productId}:`, error);
                  return of(null);
                }),
                shareReplay(1)
              ));
            });

            // Combine all user and product requests
            const userRequests = Array.from(userCache.values());
            const productRequests = Array.from(productCache.values());

            console.log('User requests:', userRequests.length);
            console.log('Product requests:', productRequests.length);

            // Execute all requests in parallel
            forkJoin({
              users: forkJoin(userRequests),
              products: forkJoin(productRequests)
            }).subscribe({
              next: ({ users, products }) => {
                console.log('All users loaded:', users);
                console.log('All products loaded:', products);

                // Create maps for quick lookup
                const userMap = new Map<number, any>();
                const productMap = new Map<number, any>();

                const userIdArray = Array.from(userIds);
                const productIdArray = Array.from(productIds);

                userIdArray.forEach((id, index) => {
                  userMap.set(id, users[index]);
                });

                productIdArray.forEach((id, index) => {
                  productMap.set(id, products[index]);
                });

                // Process all items
                const orderedProducts: OrderedProduct[] = [];

                allItems.forEach(({ order, item }) => {
                  const user = userMap.get(order.userId);
                  const product = productMap.get(item.productId);

                  console.log(`Processing item ${item.productId} for order ${order.id}:`, { user, product });

                  const orderedProduct: OrderedProduct = {
                    orderId: order.id,
                    orderDate: order.orderDate,
                    orderStatus: order.status,
                    customerName: user?.fullname || `User ${order.userId}`,
                    productId: item.productId,
                    productName: product?.productName || `Product ${item.productId}`,
                    category: product?.category?.categoryName || 'Unknown',
                    quantity: item.quantity,
                    unitPrice: item.price || 0,
                    totalPrice: item.quantity * (item.price || 0),
                    description: product?.description || ''
                  };

                  orderedProducts.push(orderedProduct);
                });

                console.log('Final orderedProducts:', orderedProducts.length);
                this.dataSource.data = orderedProducts;
                this.loading = false;
              },
              error: (error) => {
                console.error('Error loading users/products:', error);
                this.toastr.error('Lỗi khi tải thông tin sản phẩm hoặc khách hàng');
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error loading order items:', error);
            this.toastr.error('Lỗi khi tải chi tiết đơn hàng: ' + (error.error?.message || error.message || 'Unknown error'));
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.toastr.error('Lỗi khi tải danh sách sản phẩm đã đặt: ' + (error.error?.message || error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'badge-warning';
      case 1:
        return 'badge-info';
      case 2:
        return 'badge-primary';
      case 3:
        return 'badge-info';
      case 4:
        return 'badge-success';
      case 5:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Chờ xác nhận';
      case 1:
        return 'Đã xác nhận';
      case 2:
        return 'Đang xử lý';
      case 3:
        return 'Đang giao hàng';
      case 4:
        return 'Đã giao hàng';
      case 5:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getTotalQuantity(): number {
    return this.dataSource.data.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalRevenue(): number {
    return this.dataSource.data.reduce((total, item) => total + item.totalPrice, 0);
  }

  getTotalOrders(): number {
    const uniqueOrders = new Set(this.dataSource.data.map(item => item.orderId));
    return uniqueOrders.size;
  }

  getTotalProducts(): number {
    const uniqueProducts = new Set(this.dataSource.data.map(item => item.productId));
    return uniqueProducts.size;
  }
}
