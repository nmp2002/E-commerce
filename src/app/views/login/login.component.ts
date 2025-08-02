import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { TokenStorageService } from '../../_services/token-storage.service';
import { first } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.reloadPage();
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;
    this.authService.login(username, password).subscribe({
      next: data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.reloadPage();
        }
      },
      error: err => {
        console.log(err);
        this.errorMessage = err.status == 0 ? ("Mất kết nối với máy chủ, vui lòng liên hệ admin") : err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    this.router.navigate(['/homepage']);
  }
  redirectToHome(): void {
    this.router.navigate(['/']); // Chuyển hướng về trang chủ
  }

  // Xóa hàm loginWithGoogle vì chưa được implement trong AuthService
  // Thay thế bằng thông báo tạm thời
  loginWithGoogle(): void {
    this.errorMessage = 'Tính năng đăng nhập bằng Google đang được phát triển';
    this.isLoginFailed = true;
  }
}
