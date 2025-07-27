import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderedProductsComponent } from './ordered-products/ordered-products.component';
import { OrderProductDetailComponent } from './ordered-products/order-product-detail.component';

const routes: Routes = [
  {
    path: 'ordered-products',
    component: OrderedProductsComponent
  },
  {
    path: 'ordered-products/:orderId/:productId',
    component: OrderProductDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemRoutingModule { }
