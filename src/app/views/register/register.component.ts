import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from '../../_services/user.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: any = {
    fullname: null,
    email: null,
    username: null,
    password: null,
    confirmPassword: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const { username, email, password, fullname, address, telephone } = this.form;

    this.userService.publicRegister(
      username,
      email,
      password,
      fullname,
      address,
      telephone
    ).subscribe({
      next: (data) => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }

  redirectToHome(): void {
    this.router.navigate(['/']);
  }
}
