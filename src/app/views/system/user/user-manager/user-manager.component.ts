import { Component, Injectable, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { UserService } from '../../../../_services/user.service';
import { User } from '../../../../model/user';
import { UserChangePassComponent } from '../user-change-pass/user-change-pass.component';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-tables',
  templateUrl: './user-manager.component.html'
})

export class UserManagerComponent implements OnInit {
  userName = '';
  departmentname = '';
  fullname = '';
  status = '';
  constructor(public dialog: MatDialog, private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService) { }

  users: User[] = [];
  currentUser: User = {};
  currentIndex = -1;
  title = '';
  pageable: any;
  isLast = false;
  activePage = 4;
  page = 0;
  count = 0;
  totalPages = 0
  pageSize = 3;
  pageSizes = [3, 6, 9];

  ngOnInit(): void {
    this.retrieveTutorials(1);
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  public encryptData(input: any): any {
    return (input != null && input != undefined && input != '') ? btoa(input) : null;
  }

  public decryptData(input: any): any {
    return (input != null && input != undefined && input != '') ? atob(input) : null;
  }

  retrieveTutorials(page: number): void {
    this.userService.searchUser(this.userName, this.fullname, this.departmentname, this.status, page, 10).subscribe({
      next: data => {
        this.users = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        console.log(data);
      },
      error: err => {
      }
    });
  }

  findUser(): void {
    this.userService.searchUser(this.userName, this.fullname, this.departmentname, this.status, 1, 10).subscribe({
      next: data => {
        this.users = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        console.log(data);
      },
      error: err => {
      }
    });
  }

  deleteUser(user: User): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa người dùng!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(String(user.userName)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Xóa người dùng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa người dùng thất bại !', {
              timeout: 3000,
              failure: {
                childClassName: 'notiflix-notify-failure',
              }
            });
          }
        });
      }
    })
  }

  lockUser(user: User): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa người dùng!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.lockUser(String(user.userName)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Khóa người dùng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa người dùng thất bại !', {
              timeout: 3000,
              failure: {
                childClassName: 'notiflix-notify-failure',
              }
            });
          }
        });
      }
    });
  }

  unlockUser(user: User): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn mở khóa người dùng!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.unlockUser(String(user.userName)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Mở khóa người dùng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Mở khóa người dùng thất bại !', {
              timeout: 3000,
              failure: {
                childClassName: 'notiflix-notify-failure',
              }
            });
          }
        });
      }
    });
  }

  changePassword(event: any): void {
    let data = {
      userId: event,
      isAdminReset: true
    }
    const dialogRef = this.dialog.open(UserChangePassComponent, {
      data: data,
      width: '50%'
    });
  }

  handlePageChange(event: number): void {
    this.page = event;
    this.retrieveTutorials(this.page);
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.retrieveTutorials(this.page);
  }

  refreshList(): void {
    this.retrieveTutorials(this.page);
    this.currentUser = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(user: User, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }
}
