
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { TblDepartmentService } from '../../../../_services/department.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblDepartment } from '../../../../model/TblDepartment';

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
  templateUrl: './department-manager.component.html'
})

export class DepartmentManagerComponent implements OnInit {

  departmentCode = '';
  departmentName = '';
  status = '';
  constructor(private tokenService: TokenStorageService,
    private activatedRoute: ActivatedRoute,
    private departmentService: TblDepartmentService) { }

  depts: TblDepartment[] = [];
  currentDept: TblDepartment = {};
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

  findDepartment(): void {
    this.departmentService.findDepartment(this.departmentName, this.departmentCode, this.status, 1, 10).subscribe({
      next: data => {
        this.depts = data.content;
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

  retrieveTutorials(page: number): void {
    this.departmentService.findDepartment(this.departmentName, this.departmentCode, this.status, page, 10).subscribe({
      next: data => {
        this.depts = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        this.isLast = data.isLast;
        console.log(data);
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
    this.currentDept = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(dept: TblDepartment, index: number): void {
    this.currentDept = dept;
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }

  deleteDepartment(dept: TblDepartment): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa đơn vị !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.departmentService.deleteDepartment(Number(dept.id)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Xóa đơn vị thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa đơn vị thất bại !', {
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

  lockDepartment(dept: TblDepartment): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa đơn vị!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.departmentService.lockDepartment(Number(dept.id)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Khóa đơn vị thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa đơn vị thất bại !', {
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
