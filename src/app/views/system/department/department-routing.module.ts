import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentManagerComponent } from './department-manager/department-manager.component';
import { DepartmentCreateComponent } from './department-create/department-create.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng'
    },
    children: [
      {
        path: 'department-manager',
        component: DepartmentManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo đơn vị'
        }
      },
      {
        path: 'department-create',
        component: DepartmentCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới đơn vị'
        }
      },
      {
        path: 'department-update/:id',
        component: DepartmentCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật đơn vị'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }

