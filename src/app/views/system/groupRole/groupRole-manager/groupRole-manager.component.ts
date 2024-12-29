
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { GroupRoleService } from '../../../../_services/groupRole.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { GroupRole } from '../../../../model/GroupRole';

export interface todo {
  groupRoleCode: string;
  groupRoleName: string;
  id: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-tables',
  templateUrl: './groupRole-manager.component.html'
})

export class GroupRoleManagerComponent implements OnInit {

  groupRoleCode = '';
  groupRoleName = '';
  status = '';
  constructor(private tokenService: TokenStorageService,
    private activatedRoute: ActivatedRoute,
    private groupRoleService: GroupRoleService) { }

  groupRoles: GroupRole[] = [];
  currentGroupRole: GroupRole = {};
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

  findGroupRole(): void {
    this.groupRoleService.findGroupRole(this.groupRoleName, this.groupRoleCode, this.status, 1, 10).subscribe({
      next: data => {
        this.groupRoles = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
      }, error: err => { }
    });
  }

  retrieveTutorials(page: number): void {
    this.groupRoleService.findGroupRole(this.groupRoleName, this.groupRoleCode, this.status, page, 10).subscribe({
      next: data => {
        this.groupRoles = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        this.isLast = data.isLast;
      }, error: err => { }
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
    this.currentGroupRole = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(groupRole: GroupRole, index: number): void {
    this.currentGroupRole = groupRole;
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }

  deleteGroupRole(groupRole: GroupRole): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa nhóm vai trò !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.groupRoleService.deleteGroupRole(Number(groupRole.id)).subscribe({
          next: data => {

            Notify.success('Xóa nhóm vai trò thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa nhóm vai trò thất bại !', {
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

  lockGroupRole(groupRole: GroupRole): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa nhóm vai trò!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.groupRoleService.lockGroupRole(Number(groupRole.id)).subscribe({
          next: data => {

            Notify.success('Khóa nhóm vai trò thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa nhóm vai trò thất bại !', {
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
}
