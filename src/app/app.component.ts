import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { IconSetService } from '@coreui/icons-angular';
import { LoadingService } from './_services/loading.service';
import { TokenStorageService } from './_services/token-storage.service';
import { iconSubset } from './icons/icon-subset';

@Component({
  selector: 'body',
  template: `
    <div class="page-overlay-wrapper" *ngIf="loadingService.isLoading$ | async">
        <div class="icon-spinner"></div>
        <div class="icon-spinner-text">Loading<span class="icon-spinner-text-dot">...</span></div>
    </div>
    <router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  title = 'ACE - Quản lí sân bóng đá';

  constructor(
    private router: Router,
    private titleService: Title,
    private tokenService: TokenStorageService,
    private iconSetService: IconSetService,
    public loadingService: LoadingService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        if (evt instanceof NavigationStart) {
          this.tokenService.getButtonByMenu(evt.url);
        }
        return;
      }
    });
  }
}
