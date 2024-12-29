import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleManagerComponent } from './role-manager/role-manager.component';
import { RoleCreateComponent } from './role-create/role-create.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng'
    },
    children: [
      {
        path: 'role-manager',
        component: RoleManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo vai trò'
        }
      },
      {
        path: 'role-create',
        component: RoleCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới vai trò'
        }
      },
      {
        path: 'role-update/:id',
        component: RoleCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật vai trò'
        }
      },
      {
        path: 'role-permission/:id',
        component: RolePermissionComponent,
        data: {
          title: 'Phân quyền chức năng'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoleRoutingModule { }

