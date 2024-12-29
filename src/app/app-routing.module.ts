import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './_services/auth-guard.service';
import { DefaultLayoutComponent } from './containers';
import { LoginComponent } from './views/login/login.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
   // canActivate: [AuthGuardService],
    children: [
      {
        path: 'dashboard',
       // canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          )
      },
      {
        path: 'user',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/user/user.module').then((m) => m.UserModule)
      },
      {
        path: 'department',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/department/department.module').then(
            (m) => m.DepartmentModule
          )
      },
      {
        path: 'groupRole',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/groupRole/groupRole.module').then(
            (m) => m.GroupRoleModule
          )
      },
      {
        path: 'role',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/role/role.module').then((m) => m.RoleModule)
      },
      {
        path: 'field',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/field/field.module').then((m) => m.FieldModule)
      },
      {
        path: 'menu',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/menu/menu.module').then((m) => m.MenuModule)
      },
      {
        path: 'menuBtn',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/menuBtn/menuBtn.module').then(
            (m) => m.MenuBtnModule
          )
      },
      {
        path: 'theme',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule)
      },
      {
        path: 'system',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/system.module').then((m) => m.SystemModule)
      },
      {
        path: 'pages',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },

    ]
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500',
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login',
    },
  },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
