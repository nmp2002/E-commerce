
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { GroupRoleService } from '../../../../_services/groupRole.service';
import { TblRoleService } from '../../../../_services/role.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { GroupRole } from '../../../../model/GroupRole';
import { TblRole } from '../../../../model/tblRole';

export interface todo {
  departmentCode: string;
  departmentName: string;
  id: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-tables',
  templateUrl: './role-manager.component.html'
})


export class RoleManagerComponent implements OnInit {

  roleCode = '';
  roleName = '';
  groupRoleId = -1;
  status = '';
  constructor(private roleService: TblRoleService,
    private tokenService: TokenStorageService,
    private activatedRoute: ActivatedRoute,
    private roleGroupService: GroupRoleService) { }

  roles: TblRole[] = [];
  tblGroupRoles: GroupRole[] = [];
  currentRole: TblRole = {};
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
    this.loadData();
    this.retrieveTutorials(1);
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  loadData(): void {
    this.roleGroupService.findAll().subscribe(data => {
      this.tblGroupRoles = data.filter((ob) => ob.status == '1');
    });
  }

  changeSelectedStatus(event: any): void {
    this.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedGroupRole(event: any): void {
    this.groupRoleId = event.target.options[event.target.options.selectedIndex].value;
  }

  findRole(): void {
    this.roleService.findRole(this.roleName, this.roleCode, this.groupRoleId, this.status, 1, 10).subscribe({
      next: data => {
        this.roles = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;

      },
      error: err => {
      }
    });
  }

  retrieveTutorials(page: number): void {
    this.roleService.findRole(this.roleName, this.roleCode, this.groupRoleId, this.status, page, 10).subscribe({
      next: data => {
        this.roles = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        this.isLast = data.isLast;

      },
      error: err => {

      }
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
    this.currentRole = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(dept: TblRole, index: number): void {
    this.currentRole = dept;
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }

  deleteRole(role: TblRole): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa vai trò !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(Number(role.id)).subscribe({
          next: data => {

            Notify.success('Xóa vai trò thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa vai trò thất bại !', {
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

  lockRole(role: TblRole): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa vai trò!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.lockRole(Number(role.id)).subscribe({
          next: data => {

            Notify.success('Khóa vai trò thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa vai trò thất bại !', {
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
