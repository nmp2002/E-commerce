import { Component, HostListener, OnInit } from '@angular/core';
import { NotificationService } from '../../_services/notification.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { navItems } from './_nav';
import { UserIdleService } from 'angular-user-idle';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
})
export class DefaultLayoutComponent implements OnInit {

  isShowNotification = false;
  isExpiredSession = false;
  notificationContent = '';
  isLoggedIn = false; // Thêm thuộc tính này
  public navItems = navItems;
  public perfectScrollbarConfig = {
    suppressScrollX: true
  };
  constructor(private tokenStorage: TokenStorageService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userIdle: UserIdleService) { }

  ngOnInit(): void {
    this.loadDataControl();
    this.isLoggedIn = !!this.tokenStorage.getToken(); // true nếu đã đăng nhập

    var navItemsValue = this.tokenStorage.getListMenuTree();
    this.navItems = navItemsValue != null && navItemsValue != undefined ? navItemsValue : [];
  }

  loadDataControl() {
    // this.notificationService.getNotification().subscribe((data) => {
    //   if (data != null && data != undefined) {
    //     if (data.content != null && data.content != undefined && data.content.trim() != '') {
    //       this.isShowNotification = true;
    //       this.notificationContent = data.content;
    //     }
    //   }
    // });
  }

  // catchTimoutInActivity() {
  //   this.userIdle.resetTimer();
  //   this.userIdle.startWatching();
  //   // Show ra console dem timeout / dong lai de ko viet log nhieu
  //   // this.userIdle.onTimerStart().subscribe(count => console.log(count));
  //   this.userIdle.onTimeout().subscribe(() => {
  //     this.userIdle.resetTimer();
  //     this.userIdle.stopTimer();
  //     if (!this.isExpiredSession) {
  //       this.authService.logOut();
  //       this.isExpiredSession = true;
  //     }
  //   });
  // }

  // @HostListener('window:mousemove') refreshUserState() {
  //   this.userIdle.stopTimer();
  // }
}
