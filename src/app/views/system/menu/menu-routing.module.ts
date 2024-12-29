import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuManagerComponent } from './menu-manager/menu-manager.component';
import { MenuCreateComponent } from './menu-create/menu-create.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng',
    },
    children: [
      {
        path: 'menu-manager',
        component: MenuManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo chức năng'
        }
      },
      {
        path: 'menu-create',
        component: MenuCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới chức năng'
        }
      },
      {
        path: 'menu-update/:menuId',
        component: MenuCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật chức năng'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule { }

