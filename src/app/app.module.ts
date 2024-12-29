import { NgModule } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe, DecimalPipe} from '@angular/common';
import { ChartjsModule } from '@coreui/angular-chartjs';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
} from './containers';

import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SharedModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
  TableModule,
  CarouselModule,
  
} from '@coreui/angular';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthGuardService } from './_services/auth-guard.service';
import { TokenStorageService } from './_services/token-storage.service';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { MatDialogModule } from '@angular/material/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Constants } from './common/Constants';
import { DateTimeUtils } from './common/DateTimeUtils';
import { NumberUtils } from './common/NumberUtils';
import { DOMAIN_PATH } from './_services/hvnhconst';
import { LoadingService } from './_services/loading.service';
import { AuthInterceptor } from './_helpers/auth.interceptor';
//import { UserIdleModule } from 'angular-user-idle';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
];

const DOMAIN_URL = DOMAIN_PATH;
export function jwtOptionsFactory(tokenService: TokenStorageService) {
  return {
    tokenGetter: () => {
      return tokenService.getToken();
    },
    allowedDomains: [DOMAIN_URL]
  }
}

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS],
  imports: [
    NgMultiSelectDropDownModule.forRoot(),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [TokenStorageService]
      }
    }),
    // `timeout` is 900 (15 minutes)
    //UserIdleModule.forRoot({ idle: 1, timeout: 3600, ping: 0 }),
    BrowserModule,
    CKEditorModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    PerfectScrollbarModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SidebarModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    CardModule,
    HttpClientModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTableModule,
    MatTreeModule,
    TableModule,
    CarouselModule,
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CdkTableModule,
    CdkTreeModule,
    ChartjsModule 
  ],
  exports: [MatIconModule, MatButtonModule],
  providers: [
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    TokenStorageService,
    IconSetService,
    AuthGuardService,
    LoadingService,
    Constants,
    DateTimeUtils,
    NumberUtils,
    Title,
    DatePipe,
    DecimalPipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
