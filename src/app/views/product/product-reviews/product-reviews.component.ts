import { Component, OnInit, Input } from '@angular/core';
import { ReviewService } from '../../../_services/review.service';
import { ProductReview } from '../../../model/review.model';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  reviews: ProductReview[] = [];
  averageRating: number = 0;
  userReview: ProductReview | null = null;
  isLoggedIn = false;
  userId: number | null = null;

  constructor(
    private reviewService: ReviewService,
    private tokenStorage: TokenStorageService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorage.getUser();
    if (this.isLoggedIn) {
      this.userId = this.tokenStorage.getUser().id;
    }
    this.loadReviews();
    this.loadAverageRating();
  }

  loadReviews(): void {
    this.reviewService.getProductReviews(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        if (this.userId) {
          this.userReview = reviews.find(r => r.userId === this.userId) || null;
        }
      },
      error: (error) => {
        this.toastr.error('Không thể tải đánh giá sản phẩm');
        console.error('Error loading reviews:', error);
      }
    });
  }

  loadAverageRating(): void {
    this.reviewService.getAverageRating(this.productId).subscribe({
      next: (rating) => {
        this.averageRating = rating;
      },
      error: (error) => {
        console.error('Error loading average rating:', error);
      }
    });
  }

  submitReview(rating: number, comment: string): void {
    if (!this.isLoggedIn || !this.userId) {
      this.toastr.warning('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    const review: Omit<ProductReview, 'reviewId' | 'createdAt'> = {
      userId: this.userId,
      productId: this.productId,
      rating,
      comment
    };

    if (this.userReview) {
      this.reviewService.updateReview(this.userReview.reviewId, review).subscribe({
        next: () => {
          this.toastr.success('Cập nhật đánh giá thành công');
          this.loadReviews();
          this.loadAverageRating();
        },
        error: (error) => {
          this.toastr.error('Không thể cập nhật đánh giá');
          console.error('Error updating review:', error);
        }
      });
    } else {
      this.reviewService.createReview(review).subscribe({
        next: () => {
          this.toastr.success('Đánh giá sản phẩm thành công');
          this.loadReviews();
          this.loadAverageRating();
        },
        error: (error) => {
          this.toastr.error('Không thể đánh giá sản phẩm');
          console.error('Error creating review:', error);
        }
      });
    }
  }

  deleteReview(): void {
    if (!this.userReview) return;

    this.reviewService.deleteReview(this.userReview.reviewId).subscribe({
      next: () => {
        this.toastr.success('Xóa đánh giá thành công');
        this.userReview = null;
        this.loadReviews();
        this.loadAverageRating();
      },
      error: (error) => {
        this.toastr.error('Không thể xóa đánh giá');
        console.error('Error deleting review:', error);
      }
    });
  }
}
