import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { GroupRoleService } from '../../../../_services/groupRole.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { Constants } from '../../../../common/Constants';

@Component({
  selector: 'groupRole-create',
  templateUrl: './groupRole-create.component.html'
})
export class GroupRoleCreateComponent implements OnInit {
  form: any = {
    id: null,
    groupRoleCode: null,
    groupRoleName: null,
    description: null,
    status: '',
    groupPermission: null
  };
  isSuccessful = false;
  errorMessage = '';
  isUpdate = false;

  dropdownListRule: any[] = [];
  selectedItemsRules: any[] = [];
  dropdownSettingsRule: IDropdownSettings = {
    idField: 'key',
    textField: 'value',
    allowSearchFilter: true,
    enableCheckAll: true,
    selectAllText: "Tất cả",
    unSelectAllText: "Tất cả",
    searchPlaceholderText: "Lọc nhanh",
    noDataAvailablePlaceholderText: "Không có bản ghi"
  };

  constructor(
    private tokenService: TokenStorageService,
    private groupRoleService: GroupRoleService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(): void {
    this.dropdownListRule = Constants.map_Rule_Action_DATA;
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
      if (data.get('id') != null && data.get('id') != undefined && data.get('id') != '') {
        this.groupRoleService.findById(Number(data.get('id'))).subscribe(data => {
          this.form = data;
          this.isUpdate = true;
          if (this.form.groupPermission != null && this.form.groupPermission != undefined && this.form.groupPermission != '') {
            let arrPermission = this.form.groupPermission.split(',');
            let arrPermissionSelected = [];
            if (arrPermission != null && arrPermission != undefined) {
              for (let i = 0; i < arrPermission.length; i++) {
                for (let j = 0; j < this.dropdownListRule.length; j++) {
                  if (this.dropdownListRule[j].key == arrPermission[i].trim()) {
                    this.dropdownListRule[j].selected = true;
                    arrPermissionSelected.push(this.dropdownListRule[j]);
                  }
                }
              }
            }
            this.selectedItemsRules = arrPermissionSelected;
          }
        });
      }
    });
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  changeSelectedStatus(event: any): void {
    this.form.status = event.target.options[event.target.options.selectedIndex].value;
  }

  onSubmit(): void {
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    let arrGroupPermis: any = '';
    if (this.selectedItemsRules.length > 0) {
      this.selectedItemsRules.forEach((row) => {
        if (arrGroupPermis != '') {
          arrGroupPermis = arrGroupPermis.concat(',').concat(row.key);
        } else {
          arrGroupPermis = arrGroupPermis.concat(row.key);
        }
      });
    }
    this.groupRoleService.createOrUpdateGroupRole(this.form.id, this.form.groupRoleCode, this.form.groupRoleName, this.form.status, this.form.description, arrGroupPermis, this.isUpdate).subscribe({
      next: data => {
        this.isSuccessful = true;
        msg = this.isUpdate ? 'Cập nhật nhóm vai trò thành công !' : 'Thêm mới nhóm vai trò thành công !';
        Notify.success(msg, {
          success: {
            childClassName: 'notiflix-notify-success',
          },
        });
        this.router.navigateByUrl('/groupRole/groupRole-manager');
      },
      error: err => {
        this.isSuccessful = false;
        this.errorMessage = err.error.message;
        msg = this.isUpdate ? 'Cập nhật nhóm vai trò thất bại !' : 'Thêm mới nhóm vai trò thất bại !';
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
