import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { UserChangePassComponent } from '../../../views/system/user/user-change-pass/user-change-pass.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {

  @Input() sidebarId: string = "sidebar";

  urlAvatar: any;
  isAvatar = false;
  isAvatarDefault = false;

  constructor(private classToggler: ClassToggleService,
    private tokenStorage: TokenStorageService,
    public dialog: MatDialog, private router: Router) {
    super();
  }

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    if (user && user.id) {
      // Người dùng đã đăng nhập
      this.urlAvatar = this.tokenStorage.getAvartarByUser();
      if (this.urlAvatar) {
        this.isAvatar = true;
      } else {
        this.isAvatarDefault = true;
      }
    } else {
      // Người dùng chưa đăng nhập
      this.isAvatar = false;
      this.isAvatarDefault = false;
    }
  }
  

  logOut(): void {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }

  changePassword(): void {
    let data = {
      userId: this.tokenStorage.getUser().id,
      isAdminReset: false
    }
    const dialogRef = this.dialog.open(UserChangePassComponent, {
      data: data,
      width: '50%'
    });
  }
}
