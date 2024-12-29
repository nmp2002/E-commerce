import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { TblMenuService } from '../../../../_services/menu.service';
import { TblMenuBtnService } from '../../../../_services/menuBtn.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblMenu } from '../../../../model/tblMenu';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-menuBtn-create',
  templateUrl: './menuBtn-create.component.html'
})
export class MenuBtnCreateComponent implements OnInit {
  menuId = new FormControl(null, Validators.required);

  form: any = {
    id: null,
    menuId: '',
    btnCode: null,
    btnName: null,
    description: null,
    status: '',
    icon: null
  };
  tblMenus: TblMenu[];
  selectedMenu: TblMenu | null;
  isUpdate = false;
  errorMessage = '';

  constructor(
    private menuService: TblMenuService,
    private menuBtnService: TblMenuBtnService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService,
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
      if (data.get('id') != null && data.get('id') != undefined && data.get('id') != '') {
        this.menuBtnService.findById(Number(data.get('id'))).subscribe(data => {
          this.form = data;
          this.isUpdate = true;
        });
      }
    });

    this.menuService.findAll().subscribe(data => {
      this.tblMenus = data.filter((ob) => ob.status == '1');
      for (let menu of this.tblMenus) {
        if (this.form.menuId == menu.menuId) {
          this.selectedMenu = menu;
        }
      }
    });
  }

  changeSelectedStatus(event: any): void {
    this.form.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedMenu(): void {
    this.form.menuId = this.selectedMenu != null && this.selectedMenu!.menuId != null ? String(this.selectedMenu!.menuId) : '';
  }

  onSubmit(): void {
    if (!this.menuId.valid) {
      this.form.preventDefault();
    }
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    this.menuBtnService.createOrUpdateMenuBtn(this.form.id, this.form.menuId, this.form.btnCode,
      this.form.btnName, this.form.status, this.form.description, this.form.icon, this.isUpdate).subscribe({
        next: data => {
          msg = this.isUpdate ? 'Cập nhật button thành công !' : 'Thêm mới button thành công !';
          Notify.success(msg, {
            success: {
              childClassName: 'notiflix-notify-success'
            }
          });
          this.router.navigateByUrl('/menuBtn/menuBtn-manager');
        }, error: err => {
          this.errorMessage = err.error.message;
          msg = this.isUpdate ? 'Cập nhật button thất bại !' : 'Thêm mới button thất bại !';
          Notify.failure(this.errorMessage != null ? this.errorMessage : msg, {
            timeout: 3000,
            failure: {
              childClassName: 'notiflix-notify-failure'
            }
          });
        }
      });
  }
}
