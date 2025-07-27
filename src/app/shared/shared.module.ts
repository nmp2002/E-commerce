import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule, GridModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { VariantDetailsModalComponent } from '../views/category/variant-details-modal/variant-details-modal.component';

@NgModule({
  declarations: [
    VariantDetailsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    GridModule,
    IconModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    VariantDetailsModalComponent
  ]
})
export class SharedModule { }
