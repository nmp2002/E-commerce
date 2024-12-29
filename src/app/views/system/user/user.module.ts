import { NGX_MAT_DATE_FORMATS, NgxMatDateFormats, NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
// CoreUI Modules
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter,MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaskModule } from 'ngx-mask';
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
  ModalModule,
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
import { IconModule } from '@coreui/icons-angular';
import { DocsComponentsModule } from '@docs-components/docs-components.module';
import { UserChangePassComponent } from './user-change-pass/user-change-pass.component';
import { UserDetailComponent } from './user-info/user-info.component';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserRoutingModule } from './user-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';

const MY_DATETIME_FORMAT: NgxMatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY HH:mm',
  },
  display: {
    dateInput: 'DD/MM/YYYY HH:mm',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY' // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
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
    DocsComponentsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
    ModalModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    NgMultiSelectDropDownModule,
    NgSelectModule,
    NgxMaskModule.forRoot({
      showMaskTyped: true
    }),
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    MatDatepickerModule,
    NgxMatMomentModule,
    NgxMatDatetimePickerModule
  ],
  declarations: [
    UserManagerComponent,
    UserRegisterComponent,
    UserChangePassComponent,
    UserDetailComponent
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT },
    { provide: NGX_MAT_DATE_FORMATS, useValue: MY_DATETIME_FORMAT },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } }
  ],
})
export class UserModule { }
