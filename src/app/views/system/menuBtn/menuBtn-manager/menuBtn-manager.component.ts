
import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';
import { TblMenuService } from '../../../../_services/menu.service';
import { TblMenuBtnService } from '../../../../_services/menuBtn.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblMenu } from '../../../../model/tblMenu';
import { TblMenuBtn } from '../../../../model/tblMenuBtn';

export interface todo {
  btnCode: string;
  btnName: string;
  menuId: number;
  status: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-menuBtn-manager',
  templateUrl: './menuBtn-manager.component.html'
})

export class MenuBtnManagerComponent implements OnInit {
  btnCode = '';
  btnName = '';
  menuId = -1;
  status = '';
  description = '';
  icon = '';
  constructor(private menuBtnService: TblMenuBtnService,
    private tokenService: TokenStorageService,
    private activatedRoute: ActivatedRoute,
    private menuService: TblMenuService) { }

  items: TblMenuBtn[] = [];
  tblMenus: TblMenu[] = [];
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
      this.tblMenus = data.filter((ob) => ob.status == '1');
    });
  }

  changeSelectedStatus(event: any): void {
    this.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedMenu(): void {
    this.menuId = this.selectedMenu != null && this.selectedMenu!.menuId != null ? Number(this.selectedMenu!.menuId) : -1;
  }

  findMenuBtn(): void {
    this.menuBtnService.findMenuBtn(this.btnName, this.btnCode, this.menuId, this.status, 1, 10).subscribe({
      next: data => {
        this.items = data.content;
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
    this.menuBtnService.findMenuBtn(this.btnName, this.btnCode, this.menuId, this.status, page, 10).subscribe({
      next: data => {
        this.items = data.content;
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
    this.currentIndex = -1;
  }

  setActiveTutorial(menuBtn: TblMenuBtn, index: number): void {
    this.currentIndex = index;
  }

  searchTitle(): void {
    this.page = 1;
    this.retrieveTutorials(1);
  }

  deleteMenuBtn(menuBtn: TblMenuBtn): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa button !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuBtnService.deleteMenuBtn(Number(menuBtn.id)).subscribe({
          next: data => {
            Notify.success('Xóa button thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa button thất bại !', {
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

  unlockMenuBtn(menuBtn: TblMenuBtn): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn mở khóa button!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuBtnService.unlockMenuBtn(Number(menuBtn.id)).subscribe({
          next: data => {
            Notify.success('Mở khóa button thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Mở khóa button thất bại !', {
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

  lockMenuBtn(menuBtn: TblMenuBtn): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn khóa button!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuBtnService.lockMenuBtn(Number(menuBtn.id)).subscribe({
          next: data => {
            Notify.success('Khóa button thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveTutorials(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Khóa button thất bại !', {
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
