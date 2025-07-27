import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FieldService } from '../../../_services/field.service';
import { ProductService } from '../../../_services/product.service';
import { TblCity } from '../../../model/tblCity';
import { TblDistrict } from '../../../model/tblDistrict';
import { TblWard } from '../../../model/tblWard';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, AfterViewInit {
  getImageUrl(image: string | null | undefined): string {
    if (!image || image.trim() === '') return '';
    if (image.startsWith('/9j/')) return 'data:image/jpeg;base64,' + image; // base64 JPEG
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return 'http://localhost:8080' + image;
    return image;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'http://localhost:8080/images/no-image.png';
  }

  testimonials = [
    {
      text: 'Dịch vụ tuyệt vời, giao hàng nhanh và sản phẩm chất lượng!',
      name: 'Nguyễn Văn A',
      role: 'Khách hàng',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      text: 'Tôi rất hài lòng với chính sách bảo hành và hỗ trợ.',
      name: 'Trần Thị B',
      role: 'Khách hàng',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      text: 'Giá cả hợp lý, nhiều chương trình khuyến mãi hấp dẫn.',
      name: 'Phạm Văn C',
      role: 'Khách hàng',
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg'
    }
  ];
  fields: any[] = [];
  tblCity: TblCity[];
  tblDistrict: TblDistrict[];
  tblWard: TblWard[];
  form: FormGroup;
  currentSlide = 0;
  totalSlides = 3;
  autoSlideInterval: any;

  // Thêm properties cho brands
  searchBrands: any[] = [];
  loadingBrands = false;

  heroSlides = [
    {
      image: 'assets/img/hero/slide1.jpg',
      title: 'iPhone 15 Pro Max',
      description: 'Trải nghiệm công nghệ đỉnh cao với iPhone 15 Pro Max'
    },
    {
      image: 'assets/img/hero/slide2.jpg',
      title: 'MacBook Pro M3',
      description: 'Hiệu năng vượt trội với chip M3 mới nhất'
    },
    {
      image: 'assets/img/hero/slide3.jpg',
      title: 'Samsung Galaxy S24',
      description: 'Khám phá tương lai với Galaxy S24'
    }
  ];

  categories = [
    {
      name: 'Điện thoại',
      icon: 'assets/img/categories/phone.png',
      count: 150
    },
    {
      name: 'Laptop',
      icon: 'assets/img/categories/laptop.png',
      count: 80
    },
    {
      name: 'Máy tính bảng',
      icon: 'assets/img/categories/tablet.png',
      count: 45
    },
    {
      name: 'Phụ kiện',
      icon: 'assets/img/categories/accessories.png',
      count: 200
    }
  ];

  flashSaleProducts = [
    {
      name: 'iPhone 14 Pro',
      image: 'assets/img/products/iphone14.jpg',
      currentPrice: 24990000,
      oldPrice: 29990000,
      discount: 17,
      soldCount: 45,
      soldPercent: 75
    },
    {
      name: 'Samsung Galaxy S23',
      image: 'assets/img/products/s23.jpg',
      currentPrice: 18990000,
      oldPrice: 22990000,
      discount: 20,
      soldCount: 30,
      soldPercent: 60
    },
    {
      name: 'MacBook Air M2',
      image: 'assets/img/products/macbook.jpg',
      currentPrice: 29990000,
      oldPrice: 34990000,
      discount: 15,
      soldCount: 25,
      soldPercent: 50
    }
  ];

  featuredProducts: any[] = [];

  brands = [
    {
      name: 'Apple',
      logo: 'assets/img/brands/apple.png'
    },
    {
      name: 'Samsung',
      logo: 'assets/img/brands/samsung.png'
    },
    {
      name: 'Xiaomi',
      logo: 'assets/img/brands/xiaomi.png'
    },
    {
      name: 'Asus',
      logo: 'assets/img/brands/asus.png'
    }
  ];

  constructor(
    private fieldService: FieldService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      search: [''],
      category: [''],
      brand: [''],
      priceRange: [''],
      provinceid: [''],
      districtId: [''],
      wardId: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupCategoryChangeListener();
    // Lấy sản phẩm nổi bật từ backend
    this.productService.getFeaturedProducts().subscribe(products => {
      console.log('Featured products:', products);
      // Lọc: mỗi brand 1 sản phẩm, có ảnh, tối đa 4 sản phẩm
      const seenBrands = new Set<string>();
      const filtered = [];
      for (const p of products) {
        const brand = p.brand ?? '';
        if (brand && p.image && p.image.trim() !== '' && !seenBrands.has(brand)) {
          filtered.push(p);
          seenBrands.add(brand);
        }
        if (filtered.length === 4) break;
      }
      this.featuredProducts = filtered;
    });
  }

  ngAfterViewInit(): void {
    this.startAutoSlide();
    this.initializeSliderControls();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  loadInitialData(): void {
    this.fieldService.getCities().subscribe((data: TblCity[]) => {
      this.tblCity = data.filter(ob => ob.active === '1');
      this.tblDistrict = [];
    });

    const savedprovinceid = sessionStorage.getItem('provinceid');
    if (savedprovinceid) {
      const provinceid = Number(savedprovinceid);
      this.form.get('provinceid')?.setValue(provinceid);
      this.loadDistricts(provinceid);
    }

    const savedDistrictId = sessionStorage.getItem('districtId');
    if (savedDistrictId) {
      const districtId = Number(savedDistrictId);
      this.form.get('districtId')?.setValue(districtId);
      this.loadWards(districtId);
    }

    const saveWardId = sessionStorage.getItem('wardId');
    if (saveWardId) {
      const wardId = Number(saveWardId);
      this.form.get('wardId')?.setValue(wardId);
    }
  }

  loadDistricts(provinceid: number): void {
    if (provinceid) {
      this.fieldService.getDistrictsByCityId(provinceid).subscribe((data: TblDistrict[]) => {
        this.tblDistrict = data.filter(ob => ob.active === '1');
        this.tblWard = [];
      });
    }
  }

  loadWards(districtId: number): void {
    if (districtId) {
      this.fieldService.getWardsByDistrictId(districtId).subscribe((data: TblWard[]) => {
        this.tblWard = data.filter(ob => ob.active === '1');
      });
    }
  }

  changeSelectedCity(event: any): void {
    const selectedprovinceid = Number(event.target.value);
    this.form.get('provinceid')?.setValue(selectedprovinceid);
    sessionStorage.setItem('provinceid', selectedprovinceid.toString());
    this.loadDistricts(selectedprovinceid);
  }

  changeSelectedDistrict(event: any): void {
    const selectedDistrictId = Number(event.target.value);
    this.form.get('districtId')?.setValue(selectedDistrictId);
    sessionStorage.setItem('districtId', selectedDistrictId.toString());
    this.loadWards(selectedDistrictId);
  }

  changeSelectedWard(event: any): void {
    const selectedWardId = Number(event.target.value);
    this.form.get('wardId')?.setValue(selectedWardId);
    sessionStorage.setItem('wardId', selectedWardId.toString());
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Dữ liệu gửi đi:', this.form.value);
      const formData = this.form.value;

      // Xử lý price range để chuyển thành min/max price
      let minPrice = 0;
      let maxPrice = 0;

      if (formData.priceRange) {
        switch (formData.priceRange) {
          case '0-10':
            minPrice = 0;
            maxPrice = 10000000; // 10 triệu
            break;
          case '10-20':
            minPrice = 10000000; // 10 triệu
            maxPrice = 20000000; // 20 triệu
            break;
          case '20-30':
            minPrice = 20000000; // 20 triệu
            maxPrice = 30000000; // 30 triệu
            break;
          case '30+':
            minPrice = 30000000; // 30 triệu
            maxPrice = 999999999; // Không giới hạn trên
            break;
        }
      }

      // Thêm min/max price vào formData
      const searchData = {
        ...formData,
        minPrice,
        maxPrice
      };

      // Chuyển hướng dựa trên category được chọn
      if (formData.category === 'laptop') {
        // Lưu dữ liệu tìm kiếm vào sessionStorage để sử dụng ở laptop-list
        sessionStorage.setItem('searchFormData', JSON.stringify(searchData));
        this.router.navigate(['/category/laptops']);
      } else if (formData.category === 'phone') {
        // Lưu dữ liệu tìm kiếm vào sessionStorage để sử dụng ở phone-list
        sessionStorage.setItem('searchFormData', JSON.stringify(searchData));
        this.router.navigate(['/category/phones']);
      } else {
        // Nếu không chọn category cụ thể, chuyển đến trang tìm kiếm chung
        sessionStorage.setItem('searchFormData', JSON.stringify(searchData));
        this.router.navigate(['/homepage/search-field-result']);
      }
    }
  }

  deleteField(field: any): void {
    if (confirm('Bạn có chắc chắn muốn xóa field này?')) {
      this.fieldService.deleteField(field.id).subscribe(
        response => {
          this.onSubmit();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  encryptData(id: number): string {
    return btoa(id.toString());
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  initializeSliderControls(): void {
    // Add click event listeners to navigation buttons
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.hero-dot');

    prevBtn?.addEventListener('click', () => this.prevSlide());
    nextBtn?.addEventListener('click', () => this.nextSlide());

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
  }

  goToSlide(index: number): void {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');

    // Remove active class from current slide and dot
    slides[this.currentSlide].classList.remove('active');
    dots[this.currentSlide].classList.remove('active');

    // Add active class to new slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');

    this.currentSlide = index;
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  setupCategoryChangeListener(): void {
    // Lắng nghe sự thay đổi của category để load brands tương ứng
    this.form.get('category')?.valueChanges.subscribe(category => {
      if (category) {
        this.loadBrandsByCategory(category);
        // Reset brand khi thay đổi category
        this.form.get('brand')?.setValue('');
      } else {
        this.searchBrands = [];
        this.form.get('brand')?.setValue('');
      }
    });
  }

  loadBrandsByCategory(category: string): void {
    this.loadingBrands = true;
    let categoryId: number;

    // Map category name to category ID
    if (category === 'laptop') {
      categoryId = 21; // Laptop category ID
    } else if (category === 'phone') {
      categoryId = 2; // Phone category ID
    } else {
      this.searchBrands = [];
      this.loadingBrands = false;
      return;
    }

    // Load products by category to extract unique brands
    this.productService.getProductsByCategoryId(categoryId).subscribe({
      next: (products: any[]) => {
        // Extract unique brands from products
        const uniqueBrands = [...new Set(products.map(product => product.brand).filter(brand => brand))];

        this.searchBrands = uniqueBrands.map(brand => ({
          name: brand,
          value: brand
        }));

        this.loadingBrands = false;
        console.log('Loaded brands for category', category, ':', this.searchBrands);
      },
      error: (error) => {
        console.error('Error loading brands for category', category, ':', error);
        this.searchBrands = [];
        this.loadingBrands = false;
      }
    });
  }
}
