import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { ChartjsModule } from '@coreui/angular-chartjs';
// CoreUI Modules
import {
  AccordionModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonModule,
  CardModule,
  CarouselModule,
  CollapseModule,
  DropdownModule,
  FormModule,
  GridModule,
  ListGroupModule,
  NavModule,
  PaginationModule,
  PlaceholderModule,
  PopoverModule,
  ProgressModule,
  SharedModule,
  SpinnerModule,
  TableModule,
  TabsModule,
  TooltipModule,
  UtilitiesModule

} from '@coreui/angular';

//views
import { IconModule } from '@coreui/icons-angular';
import { FieldCreateComponent } from './field-create/field-create.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { FieldManagerComponent } from './field-manager/field-manager.component';
import { ShiftFieldInfoComponent } from './shiftfield-info/shiftfield-info.component';
import { ShiftFieldUpdateComponent } from './shiftfield-update/shiftfield-update.component'
import { BookingModalComponent } from './booking/booking-modal.component';
import { BookingInfoComponent } from './booking-info/booking-info.component';
import { FieldCheckingComponent } from './field-checking/field-checking.component';
import { RevenueFieldComponent } from './revenue-field/revenue-field.component';
// Components Routing
import { FieldRoutingModule } from './field-routing.module';


@NgModule({
  imports: [
    FieldRoutingModule,
    FormsModule,
    MatPaginatorModule,
    NgMultiSelectDropDownModule,
    NgSelectModule,
    IconModule,
    CommonModule,
    AccordionModule,
    BadgeModule,
    BreadcrumbModule,
    ButtonModule,
    CardModule,
    CollapseModule,
    GridModule,
    UtilitiesModule,
    SharedModule,
    ListGroupModule,
    IconModule,
    ListGroupModule,
    PlaceholderModule,
    ProgressModule,
    SpinnerModule,
    TabsModule,
    NavModule,
    TooltipModule,
    CarouselModule,
    FormModule,
    ReactiveFormsModule,
    DropdownModule,
    PaginationModule,
    PopoverModule,
    TableModule,
    MatTableModule,
    MatIconModule,
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgMultiSelectDropDownModule,
    MatDividerModule,
    ChartjsModule 
  ],
  declarations: [
    FieldCreateComponent,
    FieldManagerComponent,
    ShiftFieldUpdateComponent,
    ShiftFieldInfoComponent,
    BookingModalComponent,
    BookingInfoComponent,
    FieldCheckingComponent,
    RevenueFieldComponent
  ]

})
export class FieldModule { }
