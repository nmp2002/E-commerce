import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../model/product.model';
import { ProductService } from '../../../_services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-variant-details-modal',
  templateUrl: './variant-details-modal.component.html',
  styleUrls: ['./variant-details-modal.component.scss']
})
export class VariantDetailsModalComponent implements OnInit {
  @Input() groupCode: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() viewProduct = new EventEmitter<number>();

  variants: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.groupCode) {
      this.loadVariants();
    }
  }

  loadVariants(): void {
    this.loading = true;
    this.productService.getProductsByGroupCode(this.groupCode!).subscribe({
      next: (data) => {
        console.log('Fetched variants for groupCode ' + this.groupCode + ':', data);
        this.variants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading variants:', err);
        this.toastr.error('Không thể tải danh sách phiên bản.');
        this.loading = false;
        this.close();
      }
    });
  }

  // Helper to get specific attributes for display
  getAttribute(product: Product, attributeName: string): string {
    const attribute = product.attributes?.find(a => a.name.toLowerCase() === attributeName.toLowerCase());
    return attribute ? attribute.value : '-';
  }

  onViewProduct(productId: number): void {
    this.viewProduct.emit(productId);
  }

  close(): void {
    this.closeModal.emit();
  }
}
