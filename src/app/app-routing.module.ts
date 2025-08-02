import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './_services/auth-guard.service';
import { DefaultLayoutComponent } from './containers';
import { LoginComponent } from './views/login/login.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { RegisterComponent } from './views/register/register.component';
import { LaptopListComponent } from './views/category/laptop-list/laptop-list.component';
import { PhoneListComponent } from './views/category/phone-list/phone-list.component';
import { CartComponent } from './views/cart/cart.component';
import { CheckoutComponent } from './views/checkout/checkout.component';
import { OrderConfirmationComponent } from './views/order-confirmation/order-confirmation.component';
import { PaymentResultComponent } from './views/checkout/payment-result/payment-result.component';
import { OrdersComponent } from './views/orders/orders.component';
import { HeadphoneListComponent } from './views/category/headphone-list/headphone-list.component';
import { ChargerListComponent } from './views/category/charger-list/charger-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
   // canActivate: [AuthGuardService],
    children: [
      {
        path: 'homepage',
       // canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          )
      },
      {
        path: 'cart',
        component: CartComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'order-confirmation',
        component: OrderConfirmationComponent
      },
      {
        path: 'order/payment-result',
        component: PaymentResultComponent
      },
      {
        path: 'orders',
        component: OrdersComponent,
        canActivate: [AuthGuardService]
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
        path: 'product',
        canActivateChild: [AuthGuardService],
        loadChildren: () =>
          import('./views/system/product/product.module').then((m) => m.ProductModule)
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
        path: 'ordered-products',
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
      {
        path: 'category/laptops',
        component: LaptopListComponent
      },
      {
        path: 'category/phones',
        component: PhoneListComponent
      },
      {
        path: 'category/headphones',
        component: HeadphoneListComponent
      },
      {
        path: 'category/chargers',
        component: ChargerListComponent
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
  {
    path: 'register',
    component: RegisterComponent
  },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
