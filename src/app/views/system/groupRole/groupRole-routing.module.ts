import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupRoleManagerComponent } from './groupRole-manager/groupRole-manager.component';
import { GroupRoleCreateComponent } from './groupRole-create/groupRole-create.component';
import { GroupRolePermissionComponent } from './groupRole-permission/groupRole-permission.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng'
    },
    children: [
      {
        path: 'groupRole-manager',
        component: GroupRoleManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo nhóm vai trò'
        }
      },
      {
        path: 'groupRole-create',
        component: GroupRoleCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới nhóm vai trò'
        }
      },
      {
        path: 'groupRole-update/:id',
        component: GroupRoleCreateComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật nhóm vai trò'
        }
      },
      {
        path: 'groupRole-permission/:id',
        component: GroupRolePermissionComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Phân quyền chức năng'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoleRoutingModule { }

