import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../../_services/auth-guard.service';
import { FieldCreateComponent } from './field-create/field-create.component';
import {FieldManagerComponent} from './field-manager/field-manager.component'
import { ShiftFieldUpdateComponent } from './shiftfield-update/shiftfield-update.component';
import { ShiftFieldInfoComponent } from './shiftfield-info/shiftfield-info.component';
import { BookingModalComponent } from './booking/booking-modal.component';
import { BookingInfoComponent } from './booking-info/booking-info.component';
import { FieldCheckingComponent } from './field-checking/field-checking.component';
import { RevenueFieldComponent } from './revenue-field/revenue-field.component';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo sân bóng'
    },
    children: [
      {
        path: 'field-create',
        component: FieldCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới sân bóng'
        }
      },
      {
        path: 'field-manager',
        component: FieldManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Quản lí sân bóng'
        }
      },
      {
        path: 'field-update/:id',
        component: FieldCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Update sân bóng'
        }
      },
      {
        path: 'shiftfield',
        component: ShiftFieldUpdateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Quản lí sân bóng'
        }
      },
      {
        path: 'shiftfield-info',
        component: ShiftFieldInfoComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thông tin ca sân'
        }
      },
      {
        path: 'booking',
        component: BookingModalComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thông tin đặt sân'
        }
      },
      {
        path: 'booking-info',
        component: BookingInfoComponent,
        data: {
          title:'Thông tin chi tiết đặt sân'
        }
      },
      {
        path: 'field-checking',
        component: FieldCheckingComponent,
        data: {
          title:'Thông tin chi tiết sân '
        }
      },
      {
        path: 'revenue-field',
        component: RevenueFieldComponent,
        data: {
          title:'Thống kê doanh thu sân '
        }
      }
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class FieldRoutingModule { }
