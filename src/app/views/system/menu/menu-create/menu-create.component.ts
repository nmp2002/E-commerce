import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { TblMenuService } from '../../../../_services/menu.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblMenu } from '../../../../model/tblMenu';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-menu-create',
  templateUrl: './menu-create.component.html'
})
export class MenuCreateComponent implements OnInit {
  
  parentId = new FormControl(null, Validators.required);

  form: any = {
    menuId: null,
    parentId: '',
    menuCode: null,
    menuName: null,
    description: null,
    status: '',
    icon: null,
    url: null,
    color: null,
    text: null,
    orderNumber: null,
    title: null
  };
  tblParentMenus: TblMenu[];
  selectedMenu: TblMenu | null;
  isUpdate = false;
  errorMessage = '';

  constructor(
    private menuService: TblMenuService,
    private tokenService: TokenStorageService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  loadData(): void {
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
      if (data.get('menuId') != null && data.get('menuId') != undefined && data.get('menuId') != '') {
        this.menuService.findById(Number(data.get('menuId'))).subscribe(data => {
          this.form = data;
          this.form.title = data.title != null && data.title != undefined && data.title == '1' ? data.title : null;
          this.form.parentId = (this.form.parentId == null || this.form.parentId == 0) ? '' : this.form.parentId;
          this.isUpdate = true;
        });
      }
    });

    this.menuService.findAll().subscribe(data => {
      this.tblParentMenus = data.filter((ob) => ob.status == '1');
      for (let menu of this.tblParentMenus) {
        if (this.form.parentId == menu.menuId) {
          this.selectedMenu = menu;
        }
      }
    });
  }

  changeSelectedStatus(event: any): void {
    this.form.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedParentMenu(): void {
    this.form.parentId = this.selectedMenu != null && this.selectedMenu!.menuId != null ? Number(this.selectedMenu!.menuId) : -1;
  }

  changeSelectedTitle(event: any): void {
    let isChecked = event.target.checked;
    this.form.title = isChecked ? "1" : null;
  }

  onSubmit(): void {
    if (!this.parentId.valid) {
      this.form.preventDefault();
    }
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    this.menuService.createOrupdateMenu(this.form.menuId, this.form.menuCode, this.form.menuName, this.form.parentId, this.form.status,
      this.form.description, this.form.icon, this.form.url, this.form.color, this.form.text, this.form.orderNumber, this.form.title, this.isUpdate).subscribe({
        next: data => {
          msg = this.isUpdate ? 'Cập nhật chức năng thành công !' : 'Thêm mới chức năng thành công !';
          Notify.success(msg, {
            success: {
              childClassName: 'notiflix-notify-success',
            },
          });
          this.router.navigateByUrl('/menu/menu-manager');
        }, error: err => {
          this.errorMessage = err.error.message;
          msg = this.isUpdate ? 'Cập nhật chức năng thất bại !' : 'Thêm mới chức năng thất bại !';
          Notify.failure(this.errorMessage != null ? this.errorMessage : msg, {
            timeout: 3000,
            failure: {
              childClassName: 'notiflix-notify-failure',
            }
          });
        }
      });
  }
}
