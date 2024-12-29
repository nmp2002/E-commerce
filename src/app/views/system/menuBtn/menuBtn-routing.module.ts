import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuBtnManagerComponent } from './menuBtn-manager/menuBtn-manager.component';
import { MenuBtnCreateComponent } from './menuBtn-create/menuBtn-create.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng'
    },
    children: [
      {
        path: 'menuBtn-manager',
        component: MenuBtnManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo button'
        }
      },
      {
        path: 'menuBtn-create',
        component: MenuBtnCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới button'
        }
      },
      {
        path: 'menuBtn-update/:id',
        component: MenuBtnCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật button'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuBtnRoutingModule { }

