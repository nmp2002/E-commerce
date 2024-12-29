import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../_services/payment.service';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',  
  styleUrls: ['./payment-result.component.scss']   
})
export class PaymentResultComponent implements OnInit {
  paymentStatus: string;

  constructor(
    private route: ActivatedRoute, 
    private paymentService: PaymentService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;

    this.paymentService.vnpayReturn(queryParams)
      .subscribe(response => {
        this.paymentStatus = response;

        // Chuyển hướng về trang chủ sau 3 giây nếu thanh toán thành công
        if (response.includes('Payment success')) {
          setTimeout(() => {
            this.router.navigate(['/']); // Chuyển về trang chủ
          }, 5000); // Delay 5 giây
        }
      }, error => {
        this.paymentStatus = 'Payment verification failed';
      });
  }


  
}
