import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
@NgModule({
  imports: [
    DashboardRoutingModule,
    CardModule,
    NavModule,
    IconModule,
    TabsModule,
    CommonModule,
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
  ],
  declarations: [ HomepageComponent,SearchFieldResultComponent,SmallFieldComponent,PaymentComponent,PaymentResultComponent,MapComponent]
})
export class DashboardModule {
}
