import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserChangePassComponent } from './user-change-pass/user-change-pass.component';
import { UserDetailComponent } from './user-info/user-info.component';
import { AuthGuardService } from '../../../_services/auth-guard.service';
import { ActionLogManagerComponent } from '../action-log/action-log-manager.component';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Khai báo người dùng'
    },
    children: [
      {
        path: 'user-register',
        component: UserRegisterComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thêm mới người dùng'
        }
      },
      {
        path: 'user-info',
        component: UserDetailComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Thông tin chi tiết người dùng'
        }
      },
      {
        path: 'user-manager',
        component: UserManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Khai báo người dùng'
        }
      },
      {
        path: 'user-update/:id',
        component: UserRegisterComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Cập nhật người dùng'
        }
      },
      {
        path: 'user-change-pass/:id',
        component: UserChangePassComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Đổi mật khẩu'
        }
      },
      {
        path: 'action-log',
        component: ActionLogManagerComponent,
        canActivate: [AuthGuardService],
        data: {
          title: 'Lịch sử Thao tác'
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

