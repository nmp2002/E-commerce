import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { AuthService } from '../../../../_services/auth.service';
import { TblDepartmentService } from '../../../../_services/department.service';
import { TblRoleService } from '../../../../_services/role.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { UserService } from '../../../../_services/user.service';
import { Constants } from '../../../../common/Constants';
import { TblDepartment } from "../../../../model/TblDepartment";
import { Objcbb } from '../../../../model/objcbb';
import { TblRole } from '../../../../model/tblRole';
import { TblUserPermission } from '../../../../model/tblUserPermission';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html'
})
export class UserRegisterComponent implements OnInit {

  public officecode = new FormControl(null, Validators.required);
  public roleId = new FormControl(null, Validators.required);

  form: any = {
    id: null,
    userName: null,
    email: null,
    password: null,
    telephone: null,
    address: null,
    departmentcode: '',
    departmentname: null,
    roleId: '',
    officecode: '',
    officename: null,
    officetype: 'G',
    officetypeName: 'Đại lý',
    officetypeQ: null,
    officetypeB: null,
    officetypeG: null,
    officetypeAll: null
  };

  tblDepartmentList: TblDepartment[];
  selectedDept: TblDepartment | null;
  tblRoles: TblRole[];
  selectedRole: TblRole | null;
  tblOfficetypes: any[];
  tblOffices: Objcbb[];
  tblUserOffices: Objcbb[];
  selectedUserOffice: Objcbb | null;
  tblAgentOffices: Objcbb[];
  dropdownListB: any[] = [];
  selectedItemsB: any[] = [];
  dropdownListG: any[] = [];
  selectedItemsG: any[] = [];
  dropdownListQ: any[] = [];
  selectedItemsQ: any[] = [];

  dropdownSettings: IDropdownSettings = {
    idField: 'key',
    textField: 'value',
    allowSearchFilter: true,
    enableCheckAll: true,
    selectAllText: "Tất cả",
    unSelectAllText: "Tất cả",
    searchPlaceholderText: "Lọc nhanh",
    noDataAvailablePlaceholderText: "Không có bản ghi"
  };
  errorMessage = '';
  isUpdate = false;
  hide = true;
  isReadonlyOfficeQ = true;
  isReadonlyOfficeB = true;
  isReadonlyOfficeG = true;
  isReadonlyOfficeAll = false;

  constructor(private authService: AuthService,
    private userService: UserService,
    private departmentService: TblDepartmentService,
    private roleService: TblRoleService,
    private tokenService: TokenStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadData();
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

  loadUserEdit(): void {
    this.tblUserOffices = this.dropdownListG;
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
      if (data.get('id') != null && data.get('id') != undefined && data.get('id') != '') {
        this.userService.findById(Number(this.decryptData(data.get('id')))).subscribe(data => {
          this.isUpdate = true;
          this.form = data;
          if (this.form.officetype != null && this.form.officetype != undefined && this.form.officetype != '') {
            if (this.isUpdate) {
              if (this.form.officetype != Constants.OFFICETYPE_G) {
                this.tblUserOffices = this.tblOffices.filter(x => x.type == this.form.officetype);
              }
            }
            this.form.officetypeName = this.getOfficeTypeNameByOfficeType(this.form.officetype);
          } else {
            this.form.officetype = Constants.OFFICETYPE_G;
            this.tblUserOffices = this.tblOffices.filter(x => x.type == this.form.officetype);
            this.form.officetypeName = this.getOfficeTypeNameByOfficeType(this.form.officetype);
          }
          for (let dept of this.tblDepartmentList) {
            if (this.form.departmentcode == dept.departmentCode) {
              this.selectedDept = dept;
            }
          }
          for (let role of this.tblRoles) {
            if (this.form.roleId == role.id) {
              this.selectedRole = role;
            }
          }
          for (let userOffice of this.tblUserOffices) {
            if (this.form.officecode == userOffice.key) {
              this.selectedUserOffice = userOffice;
            }
          }
          if (data.lstPermission != null && data.lstPermission != undefined) {
            for (let itemSelected of data.lstPermission) {
              if ((this.form.officetypeB == null || this.form.officetypeB == undefined || this.form.officetypeB == '')
                && itemSelected.officetype == Constants.OFFICETYPE_B) {
                this.form.officetypeB = itemSelected.officetype;
              }
              if ((this.form.officetypeG == null || this.form.officetypeG == undefined || this.form.officetypeG == '')
                && itemSelected.officetype == Constants.OFFICETYPE_G) {
                this.form.officetypeG = itemSelected.officetype;
              }
              if ((this.form.officetypeQ == null || this.form.officetypeQ == undefined || this.form.officetypeQ == '')
                && itemSelected.officetype == Constants.OFFICETYPE_Q) {
                this.form.officetypeQ = itemSelected.officetype;
              }
              if (itemSelected.officetype == null) {
                this.form.officetypeAll = Constants.OFFICETYPE_ALL;
                this.form.officetypeB = null;
                this.form.officetypeG = null;
                this.form.officetypeQ = null;
                this.isReadonlyOfficeB = true;
                this.isReadonlyOfficeG = true;
                this.isReadonlyOfficeQ = true;
                break;
              }
            }
            if (this.form.officetypeAll == null || this.form.officetypeAll == undefined || this.form.officetypeAll == '') {
              if (this.form.officetypeG != null && this.form.officetypeG != undefined && this.form.officetypeG != '') {
                if (this.dropdownListG.length > 0) {
                  let tblOfficeSelectedG = [];
                  for (let itemDrop of this.dropdownListG) {
                    for (let itemSelected of data.lstPermission) {
                      if (itemDrop.key == itemSelected.officecode) {
                        itemDrop.selected = true;
                        tblOfficeSelectedG.push(itemDrop);
                      }
                    }
                  }
                  this.selectedItemsG = tblOfficeSelectedG;
                  this.isReadonlyOfficeG = false;
                }
              }

              if (this.form.officetypeB != null && this.form.officetypeB != undefined && this.form.officetypeB != '') {
                if (this.dropdownListB.length > 0) {
                  let tblOfficeSelectedB = [];
                  for (let itemDrop of this.dropdownListB) {
                    for (let itemSelected of data.lstPermission) {
                      if (itemDrop.key == itemSelected.officecode) {
                        itemDrop.selected = true;
                        tblOfficeSelectedB.push(itemDrop);
                      }
                    }
                  }
                  this.selectedItemsB = tblOfficeSelectedB;
                  this.isReadonlyOfficeB = false;
                }
              }

              if (this.form.officetypeQ != null && this.form.officetypeQ != undefined && this.form.officetypeQ != '') {
                if (this.dropdownListQ.length > 0) {
                  let tblOfficeSelectedQ = [];
                  for (let itemDrop of this.dropdownListQ) {
                    for (let itemSelected of data.lstPermission) {
                      if (itemDrop.key == itemSelected.officecode) {
                        itemDrop.selected = true;
                        tblOfficeSelectedQ.push(itemDrop);
                      }
                    }
                  }
                  this.selectedItemsQ = tblOfficeSelectedQ;
                  this.isReadonlyOfficeQ = false;
                }
              }
            } else {
              // Xu ly all
              this.selectedItemsB = [];
              this.selectedItemsG = [];
              this.selectedItemsQ = [];

              this.isReadonlyOfficeB = true;
              this.isReadonlyOfficeG = true;
              this.isReadonlyOfficeQ = true;
            }

          } else {
            this.selectedItemsB = [];
            this.selectedItemsG = [];
            this.selectedItemsQ = [];

            this.isReadonlyOfficeB = true;
            this.isReadonlyOfficeG = true;
            this.isReadonlyOfficeQ = true;
          }
        });
      }
    });
  }

  async loadData(): Promise<void> {
    // await this.departmentService.findAll().subscribe(data => {
    //   this.tblDepartmentList = data.filter((ob) => ob.status == '1');
    // });

    await this.roleService.findAll().subscribe(data => {
      this.tblRoles = data.filter((ob) => ob.status == '1');
    });
  }

  getOfficeTypeNameByOfficeType(officetype: string): string {
    let officetypeName = 'Đại lý';
    if (officetype == Constants.OFFICETYPE_G) {
      officetypeName = 'Đại lý';
    }
    if (officetype == Constants.OFFICETYPE_B) {
      officetypeName = 'Công ty';
    }
    if (officetype == Constants.OFFICETYPE_Q) {
      officetypeName = 'Chi nhánh';
    }
    return officetypeName;
  }

  changeSelectedDept(): void {
    this.form.departmentcode = this.selectedDept != null && this.selectedDept!.departmentCode != null ? this.selectedDept!.departmentCode : null;
    this.form.departmentname = this.selectedDept != null && this.selectedDept!.departmentName != null ? this.selectedDept!.departmentName : null;
  }

  changeSelectedRole(): void {
    this.form.roleId = this.selectedRole != null && this.selectedRole!.id != null ? this.selectedRole!.id : null;
  }

  changeSelectedOfficetype(event: any): void {
    this.form.officetype = event.target.options[event.target.options.selectedIndex].value;
    this.form.officetypeName = event.target.options[event.target.options.selectedIndex].text;
    this.form.officecode = null;
    this.form.officename = null;
    // load lại theo officetype;
    this.tblUserOffices = this.tblOffices.filter(x => x.type == this.form.officetype);
  }

  changeSelectedOffice(): void {
    this.form.officecode = this.selectedUserOffice != null && this.selectedUserOffice!.key != null ? this.selectedUserOffice!.key : null;
    this.form.officename = this.selectedUserOffice != null && this.selectedUserOffice!.value != null ? this.selectedUserOffice!.value : null;
  }

  changeSelectedOfficeType(event: any): void {
    let isChecked = event.target.checked;
    let officetypeSelect = event.target.defaultValue;
    if (officetypeSelect != null && officetypeSelect != undefined && officetypeSelect != '') {
      if (officetypeSelect == Constants.OFFICETYPE_B && !this.isReadonlyOfficeAll) {
        this.form.officetypeB = isChecked ? officetypeSelect : null;;;
        this.isReadonlyOfficeB = !isChecked;
        this.form.officetypeAll = false;
        if (!isChecked) { this.selectedItemsB = []; }
      }
      if (officetypeSelect == Constants.OFFICETYPE_G && !this.isReadonlyOfficeAll) {
        this.form.officetypeG = isChecked ? officetypeSelect : null;
        this.isReadonlyOfficeG = !isChecked;
        this.form.officetypeAll = false;
        if (!isChecked) { this.selectedItemsG = []; }
      }
      if (officetypeSelect == Constants.OFFICETYPE_Q && !this.isReadonlyOfficeAll) {
        this.form.officetypeQ = isChecked ? officetypeSelect : null;
        this.isReadonlyOfficeQ = !isChecked;
        this.form.officetypeAll = false;
        if (!isChecked) { this.selectedItemsQ = []; }
      }
      if (officetypeSelect == Constants.OFFICETYPE_ALL) {
        this.form.officetypeAll = officetypeSelect;
        this.isReadonlyOfficeAll = isChecked;

        this.selectedItemsB = [];
        this.selectedItemsG = [];
        this.selectedItemsQ = [];

        this.form.officetypeG = null;
        this.form.officetypeB = null;
        this.form.officetypeQ = null;

        this.isReadonlyOfficeB = true;
        this.isReadonlyOfficeG = true;
        this.isReadonlyOfficeQ = true;
      }
    }
  }

  onSubmit(): void {
   // if (!this.officecode.valid || !this.roleId.valid) {
   //   this.form.preventDefault();
//}
if(!this.roleId.valid){
  this.form.preventDefault();
}
    const arrUserPermis = [] as TblUserPermission[];

    if (this.form.officetypeAll != null && this.form.officetypeAll != undefined && this.form.officetypeAll != '') {
      arrUserPermis.push(new TblUserPermission('', '', this.form.officetypeAll));
    } else {
      if (this.form.officetypeG != null && this.form.officetypeG != undefined && this.form.officetypeG != '') {
        if (this.selectedItemsG.length > 0) {
          // selected
          this.selectedItemsG.forEach(row => row.key != null && row.key != undefined && row.key != '' ? arrUserPermis.push(
            new TblUserPermission(row.key, row.value, this.form.officetypeG)) : "");
        } else {
          // all
          arrUserPermis.push(new TblUserPermission('', '', this.form.officetypeG));
        }
      }

      if (this.form.officetypeB != null && this.form.officetypeB != undefined && this.form.officetypeB != '') {
        if (this.selectedItemsB.length > 0) {
          // selected
          this.selectedItemsB.forEach(row => row.key != null && row.key != undefined && row.key != '' ? arrUserPermis.push(
            new TblUserPermission(row.key, row.value, this.form.officetypeB)) : "");
        } else {
          // all
          arrUserPermis.push(new TblUserPermission('', '', this.form.officetypeB));
        }
      }

      if (this.form.officetypeQ != null && this.form.officetypeQ != undefined && this.form.officetypeQ != '') {
        if (this.selectedItemsQ.length > 0) {
          // selected
          this.selectedItemsQ.forEach(row => row.key != null && row.key != undefined && row.key != '' ? arrUserPermis.push(
            new TblUserPermission(row.key, row.value, this.form.officetypeQ)) : "");
        } else {
          // all
          arrUserPermis.push(new TblUserPermission('', '', this.form.officetypeQ));
        }
      }
    }
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    this.authService.createOrUpdateUser(this.form.id, this.form.userName, this.form.email, this.form.password, this.form.fullname, this.form.address,
      this.form.telephone, this.form.departmentcode, this.form.departmentname, this.form.roleId, this.form.officecode, this.form.officename,
      this.form.officetype, JSON.stringify(arrUserPermis), this.isUpdate).subscribe({
        next: data => {
          msg = this.isUpdate ? 'Cập nhật người dùng thành công !' : 'Thêm mới người dùng thành công !';
          Notify.success(msg, {
            success: {
              childClassName: 'notiflix-notify-success'
            },
          });
          this.router.navigateByUrl('/user/user-manager');
        },
        error: err => {
          this.errorMessage = err.error.message;
          msg = this.isUpdate ? 'Cập nhật người dùng thất bại !' : 'Thêm mới người dùng thất bại !';
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
