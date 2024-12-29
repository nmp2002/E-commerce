import { Component, OnInit } from '@angular/core';
import { TblDepartment } from "../../../../model/TblDepartment";
import { TblDepartmentService } from '../../../../_services/department.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

@Component({
  selector: 'department-create',
  templateUrl: './department-create.component.html'
})
export class DepartmentCreateComponent implements OnInit {
  form: any = {
    id: null,
    pId: '',
    departmentcode: null,
    departmentname: null,
    description: null,
    status: ''
  };

  tblDepartmentList: TblDepartment[];
  selectedDept: TblDepartment | null;
  isSuccessful = false;
  isUpdate = false;
  errorMessage = '';

  constructor(
    private departmentService: TblDepartmentService,
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
      if (data.get('id') != null && data.get('id') != undefined && data.get('id') != '') {
        this.departmentService.findById(Number(data.get('id'))).subscribe(data => {
          this.form = data;
          this.form.pId = (this.form.pId == null || this.form.pId == 0) ? '' : this.form.pId;
          this.isUpdate = true;
        });
      }
    });

    this.departmentService.findAll().subscribe(data => {
      this.tblDepartmentList = data.filter((ob) => ob.status == '1');
      for (let dept of this.tblDepartmentList) {
        if (this.form.pId == dept.id) {
          this.selectedDept = dept;
        }
      }
    });
  }

  changeSelectedStatus(event: any): void {
    this.form.status = event.target.options[event.target.options.selectedIndex].value;
  }

  changeSelectedDept(): void {
    this.form.pId = this.selectedDept != null && this.selectedDept != undefined ? this.selectedDept.id : null;
  }

  onSubmit(): void {
    var msg = 'Đã có lỗi xảy ra trong quá trình xử lý !';
    this.departmentService.createOrupdateDepartment(this.form.id, this.form.pId, this.form.departmentCode, this.form.departmentName, this.form.status, this.form.description, this.isUpdate).subscribe({
      next: data => {
        this.isSuccessful = true;
        msg = this.isUpdate ? 'Cập nhật đơn vị thành công !' : 'Thêm mới đơn vị thành công !';
        Notify.success(msg, {
          success: {
            childClassName: 'notiflix-notify-success',
          },
        });
        this.router.navigateByUrl('/department/department-manager');
      },
      error: err => {
        this.isSuccessful = false;
        this.errorMessage = err.error.message;
        msg = this.isUpdate ? 'Cập nhật đơn vị thất bại !' : 'Thêm mới đơn vị thất bại !';
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
