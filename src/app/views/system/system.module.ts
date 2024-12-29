import { CommonModule } from '@angular/common';
import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
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
  UtilitiesModule,
} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';

// views


import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
// Components Routing
import { TextMaskModule } from 'angular2-text-mask';
import { SystemRoutingModule } from './system-routing.module';

import { ValidCodeSystemDirective } from '../../theme/validcodesystem.directive';
import { ActionLogManagerComponent } from './action-log/action-log-manager.component';

import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  providers: [{ provide: DEFAULT_CURRENCY_CODE, useValue: '' }],
  imports: [
    CommonModule,
    SystemRoutingModule,
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
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TextMaskModule,
    NgSelectModule
  ],

})
export class SystemModule { }
