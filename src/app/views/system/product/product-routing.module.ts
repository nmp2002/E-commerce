import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryCreateComponent } from './category-create/category-create.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';

const routes: Routes = [
  {
    path: '',data: {
      title: 'Khai báo sản phẩm'
    },
    children: [
      { path: 'list', component: ProductListComponent },
      { path: 'create', component: ProductCreateComponent },
      { path: 'edit/:id', component: ProductEditComponent },
      { path: 'detail/:id', component: ProductDetailComponent },
      { path: 'categories/list', component: CategoryListComponent },
      { path: 'categories/create', component: CategoryCreateComponent },
      { path: 'categories/edit/:id', component: CategoryEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
