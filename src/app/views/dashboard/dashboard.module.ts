import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AvatarModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  NavModule,
  ProgressModule,
  TableModule,
  TabsModule,
  

} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ChartjsModule } from '@coreui/angular-chartjs';

import { DashboardRoutingModule } from './dashboard-routing.module';
import {  HomepageComponent } from './homepage/homepage.component';
import { SearchFieldResultComponent } from './search-field-result/search-field-result.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { SmallFieldComponent } from './SmallField/smallField.component';
import { PaymentComponent } from '../dashboard/payment/payment.component'
import { PaymentResultComponent } from '../dashboard/payment-result/payment-result.component';
import { MapComponent } from '../dashboard/search-field-result/map/map.component';
import { DashboardComponent } from './dashBoard/dashboard.component';
@NgModule({
  imports: [
    DashboardRoutingModule,
    CardModule,
    NavModule,
    IconModule,
    TabsModule,
    CommonModule,
    MatTableModule,
    GridModule,
    ProgressModule,
    ReactiveFormsModule,
    ButtonModule,
    FormModule,
    ButtonModule,
    ButtonGroupModule,
    ChartjsModule,
    AvatarModule,
    TableModule,
    WidgetsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  declarations: [DashboardComponent, HomepageComponent,SearchFieldResultComponent,SmallFieldComponent,PaymentComponent,PaymentResultComponent,MapComponent]
})
export class DashboardModule {
}
