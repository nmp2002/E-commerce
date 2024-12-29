import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { GroupRoleService } from '../../../../_services/groupRole.service';
import { TblRoleService } from '../../../../_services/role.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { GroupRole } from '../../../../model/GroupRole';

@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html'
})
export class RoleCreateComponent implements OnInit {
  form: any = {
    id: null,
    groupRoleId: '',
    roleCode: null,
    roleName: null,
    description: null,
    status: ''
  };
  tblGroupRoles: GroupRole[];
  isUpdate = false;
  errorMessage = '';

  constructor(
    private roleService: TblRoleService,
    private tokenService: TokenStorageService,
    private roleGroupService: GroupRoleService,
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
      if (data.get('id') != null && data.get('id') != undefined && data.get('id') != '') {
        this.roleService.findById(Number(data.get('id'))).subscribe(data => {
          this.form = data;
          this.isUpdate = true;
        });
      }
    });

    this.roleGroupService.findAll().subscribe(data => {
      this.tblGroupRoles = data.filter((ob) => ob.status == '1');
    });
  }

  changeSelectedStatus(event: any): void {
    console.log(event.target);
    this.form.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedGroupRole(event: any): void {
    this.form.groupRoleId = event.target.options[event.target.options.selectedIndex].value;
  }

  onSubmit(): void {
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    this.roleService.createOrUpdateRole(this.form.id, this.form.roleCode, this.form.roleName, this.form.groupRoleId, this.form.status, this.form.description, this.isUpdate).subscribe({
      next: data => {
        msg = this.isUpdate ? 'Cập nhật vai trò thành công !' : 'Thêm mới vai trò thành công !';
        Notify.success(msg, {
          success: {
            childClassName: 'notiflix-notify-success',
          },
        });
        this.router.navigateByUrl('/role/role-manager');
      }, error: err => {
        this.errorMessage = err.error.message;
        msg = this.isUpdate ? 'Cập nhật vai trò thất bại !' : 'Thêm mới vai trò thất bại !';
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
