import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
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
import { GroupRoleManagerComponent } from '././groupRole-manager/groupRole-manager.component';
import { GroupRoleCreateComponent } from '././groupRole-create/groupRole-create.component';
import { GroupRolePermissionComponent } from '././groupRole-permission/groupRole-permission.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
// Components Routing
import { GroupRoleRoutingModule } from './groupRole-routing.module';
import { MatTreeModule } from '@angular/material/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    GroupRoleRoutingModule,
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
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDividerModule,
    NgMultiSelectDropDownModule
  ],
  declarations: [
    GroupRoleManagerComponent,
    GroupRoleCreateComponent,
    GroupRolePermissionComponent
  ]
})
export class GroupRoleModule { }
