
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { TblMenuService } from '../../../../_services/menu.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblMenu } from '../../../../model/tblMenu';

export interface todo {
  menuCode: string;
  menuName: string;
  menuId: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-menu-manager',
  templateUrl: './menu-manager.component.html'
})


export class MenuManagerComponent implements OnInit {

  menuCode = '';
  menuName = '';
  parentId = -1;
  status = '';
  constructor(private menuService: TblMenuService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService) { }

  items: TblMenu[] = [];
  tblParentMenus: TblMenu[] = [];
  selectedMenu: TblMenu | null;
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
    this.menuService.findAll().subscribe(data => {
      this.tblParentMenus = data.filter((ob) => ob.status == '1');
    });
  }

  changeSelectedStatus(event: any): void {
    this.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedParentMenu(): void {
    this.parentId = this.selectedMenu != null && this.selectedMenu!.menuId != null ? Number(this.selectedMenu!.menuId) : -1;
  }

  findMenu(): void {
    this.menuService.findMenu(this.menuName, this.menuCode, this.parentId, this.status, 1, 10).subscribe({
      next: data => {
        this.items = data.content;
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
    this.menuService.findMenu(this.menuName, this.menuCode, this.parentId, this.status, page, 10).subscribe({
      next: data => {
        this.items = data.content;
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
    this.currentIndex = -1;
  }

  setActiveTutorial(menu: TblMenu, index: number): void {
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }

  deleteMenu(menu: TblMenu): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa chức năng !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.deleteMenu(Number(menu.menuId)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Xóa chức năng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa chức năng thất bại !', {
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

  lockMenu(menu: TblMenu): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa chức năng!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.lockMenu(Number(menu.menuId)).subscribe({
          next: data => {
            console.log(data);
            Notify.success('Khóa chức năng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa chức năng thất bại !', {
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
