# Trang Quản lý Sản phẩm Đã Đặt

## Mô tả
Component này hiển thị tất cả thông tin chi tiết về các sản phẩm đã được đặt trong hệ thống. Trang này cung cấp một cái nhìn tổng quan về tất cả các sản phẩm trong các đơn hàng.

## Tính năng

### 1. Thống kê tổng quan
- **Tổng đơn hàng**: Số lượng đơn hàng có trong hệ thống
- **Sản phẩm khác nhau**: Số lượng sản phẩm unique đã được đặt
- **Tổng số lượng**: Tổng số lượng sản phẩm đã được đặt
- **Tổng doanh thu**: Tổng doanh thu từ tất cả các đơn hàng

### 2. Bảng dữ liệu chi tiết
Hiển thị thông tin chi tiết về từng sản phẩm đã đặt:
- **Mã đơn hàng**: ID của đơn hàng
- **Khách hàng**: Tên khách hàng đặt hàng
- **Ngày đặt**: Thời gian đặt hàng
- **Trạng thái**: Trạng thái hiện tại của đơn hàng
- **Tên sản phẩm**: Tên sản phẩm đã đặt
- **Danh mục**: Danh mục sản phẩm
- **Số lượng**: Số lượng sản phẩm đã đặt
- **Đơn giá**: Giá đơn vị của sản phẩm
- **Thành tiền**: Tổng tiền của sản phẩm (số lượng × đơn giá)
- **Mô tả**: Mô tả chi tiết về sản phẩm

### 3. Tính năng tìm kiếm và lọc
- Tìm kiếm theo tên sản phẩm, khách hàng
- Lọc dữ liệu theo nhiều tiêu chí

### 4. Phân trang
- Hiển thị dữ liệu theo trang
- Điều hướng giữa các trang

## Cách sử dụng

### Truy cập trang
```
http://localhost:4200/system/ordered-products
```

### API Endpoints được sử dụng
- `GET /api/orders` - Lấy danh sách tất cả đơn hàng
- `GET /api/orders/{orderId}/items` - Lấy chi tiết sản phẩm trong đơn hàng

## Cấu trúc Component

### Files
- `ordered-products.component.ts` - Logic chính của component
- `ordered-products.component.html` - Template giao diện
- `ordered-products.component.scss` - Styles CSS
- `index.ts` - Export component

### Dependencies
- `CartOrderService` - Service để lấy dữ liệu đơn hàng
- `ToastrService` - Hiển thị thông báo
- `MatTableDataSource` - Quản lý dữ liệu bảng
- `MatPaginator` - Phân trang

## Cải tiến có thể thực hiện

1. **Tích hợp ProductService**: Lấy thông tin chi tiết sản phẩm từ ProductService
2. **Thêm bộ lọc nâng cao**: Lọc theo ngày, trạng thái, danh mục
3. **Export dữ liệu**: Xuất dữ liệu ra Excel/PDF
4. **Biểu đồ thống kê**: Hiển thị biểu đồ doanh thu theo thời gian
5. **Real-time updates**: Cập nhật dữ liệu theo thời gian thực

## Lưu ý
- Component này hiện tại sử dụng dữ liệu mẫu cho một số trường
- Cần tích hợp với ProductService để lấy thông tin chi tiết sản phẩm
- Có thể cần điều chỉnh API endpoints tùy theo backend 
