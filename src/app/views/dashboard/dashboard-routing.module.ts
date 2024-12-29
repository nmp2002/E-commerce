import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/_services/auth-guard.service';

import { HomepageComponent } from './homepage/homepage.component';
import{SearchFieldResultComponent} from './search-field-result/search-field-result.component'
import { SmallFieldComponent } from './SmallField/smallField.component'
import { PaymentComponent } from '../dashboard/payment/payment.component'
import {PaymentResultComponent} from '../dashboard/payment-result/payment-result.component'
const routes: Routes = [
  {
    path: '',
    data: {
      title: $localize`Trang chủ`
    },
    children: [
      {
        path: '',
        component: HomepageComponent,
        canActivate: [AuthGuardService],
    },
      {
        path: 'search-field-result',
        component: SearchFieldResultComponent,
        data: {
          title: 'Tìm kiếm sân'
        }
      },
      {
        path: 'smallFields',
        component:  SmallFieldComponent ,
        data: {
          title: 'Thông tin sân'
        }
      },
      {
        path: 'payment/:bookingId',
        component:  PaymentComponent ,
        data: {
          title: 'Thanh toán sân'
        }
      },
      {
        path: 'payment-result',
        component:  PaymentResultComponent ,
        data: {
          title: 'Thanh toán sân'
        }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
