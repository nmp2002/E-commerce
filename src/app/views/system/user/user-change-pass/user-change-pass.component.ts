import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { AuthService } from 'src/app/_services/auth.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { UserService } from '../../../../_services/user.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './user-change-pass.component.html'
})
export class UserChangePassComponent implements OnInit {
  form = new FormGroup({ password: new FormControl(''), passwordConfirm: new FormControl('') }, { validators: confirmPasswordValidator });
  errorMessage = '';
  hide = true;
  userId: any = null;
  isAdminReset: true;

  constructor(private userService: UserService,
    private router: Router, private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<UserChangePassComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.userId = this.data.userId;
    this.isAdminReset = this.data.isAdminReset;
  }

  onCancel(isAdminReset: boolean, isOnlyClose: boolean): void {
    this.dialogRef.close();
    if (!isOnlyClose) {
      if (isAdminReset) {
        this.router.navigateByUrl('/user/user-manager');
      } else {
        this.authService.logOut();
      }
    }
  }

  public isShowButton(btnCode: string): boolean {
    console.log('isAdminReset' + this.isAdminReset);
    console.log('btnCode: ' + this.tokenService.isShowButton(btnCode, this.activatedRoute));

    return !this.isAdminReset ? true : this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    var password = this.form.controls['password'].value;
    this.userService.changePassword(this.userId, String(password)).subscribe({
      next: data => {
        Notify.success('Đổi mật khẩu thành công !', {
          success: {
            childClassName: 'notiflix-notify-success',
          },
        });
        this.onCancel(this.isAdminReset, false);
      }, error: err => {
        this.errorMessage = err.error.message;
        Notify.failure(this.errorMessage != null ? this.errorMessage : 'Đổi mật khẩu thất bại !', {
          timeout: 3000,
          failure: {
            childClassName: 'notiflix-notify-failure',
          }
        });
      }
    });
  }
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? { confirmPassword: true } : null;
};
