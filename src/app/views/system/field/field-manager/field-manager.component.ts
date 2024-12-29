import { Component, OnInit } from '@angular/core';
import { FieldService } from '../../../../_services/field.service'; 
import { TblField } from 'src/app/model/tblField';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TblCity } from 'src/app/model/tblCity';
import { TblDistrict } from 'src/app/model/tblDistrict';
import { TblWard } from 'src/app/model/tblWard';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-field-manager',
  templateUrl: './field-manager.component.html'
})
export class FieldManagerComponent implements OnInit {
  fields: any[] = [];
  tblCity: TblCity[] = [];
  tblDistrict: TblDistrict[] = [];
  tblWard: TblWard[] = [];
  fieldName = '';
  phoneNumberField = '';
  provinceName = '';
  districtName = '';
  wardName = '';
  status = '';
  isUpdate = false;
  form: any = {
    id: null,
    provinceid: '',
    wardId: '',
    districtId: '',
    status: '',
    cityName: '',
    districtName: '',
    provinceName: '',
    wardName: '',
    fieldName: '',
    phoneNumberField: '',
    day: '',
    timeStart: '',
    timeEnd: '',
    fieldType:''
  };

  constructor(
    public dialog: MatDialog, 
    private fieldService: FieldService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tokenService: TokenStorageService
  ) { }

  currentIndex = -1;
  title = '';
  pageable: any;
  isLast = false;
  activePage = 4;
  page = 0;
  count = 0;
  totalPages = 0;
  pageSize = 3;
  pageSizes = [3, 6, 9];

  ngOnInit(): void {
    this.retrieveFields(1);
    this.loadInitialData();
  }
  ngOnDestroy(): void {
 
    sessionStorage.removeItem('provinceid');
    sessionStorage.removeItem('districtId');
    sessionStorage.removeItem('wardId');
    console.log('Cleared session storage values.');
  }
  retrieveFields(page: number): void {
    this.fieldService.getFields(this.fieldName, this.districtName, this.provinceName, this.wardName, this.status, page, 10).subscribe({
      next: data => {
        this.fields = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  loadInitialData(): void {
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
        const id = data.get('id');
        if (id) {
            this.fieldService.findByIdField(Number(id)).subscribe(data => {
                this.form = data;
                this.isUpdate = true;
                this.loadDistricts(this.form.provinceid);
                this.loadWards(this.form.districtId);
            });
        }
    });

    this.fieldService.getCities().subscribe(data => {
        this.tblCity = data.filter(ob => ob.active === '1');
        this.tblDistrict = [];
    });

    const savedprovinceid = sessionStorage.getItem('provinceid');
    if (savedprovinceid) {
        this.form.provinceid = Number(savedprovinceid);
        this.loadDistricts(this.form.provinceid);
    }

    const savedDistrictId = sessionStorage.getItem('districtId');
    if (savedDistrictId) {
        this.form.districtId = Number(savedDistrictId);
        this.loadWards(this.form.districtId);
    }

    // Lắng nghe sự thay đổi của provinceid (City) và districtId
    this.watchFormChanges();
  }

  // Phương thức để lắng nghe sự thay đổi của provinceid và districtId
  watchFormChanges(): void {
    // Khi người dùng chọn lại City
    this.router.events.subscribe(() => {
      this.loadDistricts(this.form.provinceid);
      this.tblWard = []; // Reset danh sách Ward khi City thay đổi
    });

    // Khi người dùng chọn lại District
    this.router.events.subscribe(() => {
      this.loadWards(this.form.districtId);
    });
  }

  loadDistricts(provinceid: number): void {
    this.tblDistrict = []; // Reset danh sách District
    if (provinceid) {
      this.fieldService.getDistrictsByCityId(provinceid).subscribe(data => {
        this.tblDistrict = data.filter(ob => ob.active === '1');
        this.tblWard = []; // Reset danh sách Ward
      });
    }
  }

  loadWards(districtId: number): void {
    this.tblWard = []; // Reset danh sách Ward
    if (districtId) {
      this.fieldService.getWardsByDistrictId(districtId).subscribe(data => {
        this.tblWard = data.filter(ob => ob.active === '1');
      });
    }
  }

  findField(): void {
    this.fieldService.searchField(this.fieldName, this.districtName, this.provinceName, this.wardName, this.status, 1, 10).subscribe({
      next: data => {
        this.fields = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  deleteField(field: any): void {
    Swal.fire({
      text: "Bạn có chắc chắn muốn xóa sân bóng!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Quay lại'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fieldService.deleteField(field.id).subscribe({
          next: data => {
            Notify.success('Xóa sân bóng thành công !', {
              timeout: 3000,
              success: {
                childClassName: 'notiflix-notify-success',
              }
            });
            this.retrieveFields(1);
          },
          error: err => {
            Notify.failure(err.error.message != null ? err.error.message : 'Xóa sân bóng thất bại !', {
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

  updateField(field: any): void {
    this.fieldService.updateField(field.id, field.fieldName, field.provinceName, field.districtName, field.wardName, field.phoneNumberField).subscribe(
      response => {
        this.retrieveFields(this.pageable.pageNumber);
      },
      error => {
        console.error(error);
      }
    );
  }

  lockField(field: any): void {
    this.fieldService.updateFieldStatus(field.id, 0).subscribe(
      response => {
        this.retrieveFields(this.pageable.pageNumber);
      },
      error => {
        console.error(error);
      }
    );
  }

  unlockField(field: any): void {
    this.fieldService.updateFieldStatus(field.id, 1).subscribe(
      response => {
        this.retrieveFields(this.pageable.pageNumber);
      },
      error => {
        console.error(error);
      }
    );
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  public encryptData(input: any): any {
    return (input != null && input != undefined && input != '') ? btoa(input) : null;
  }

  changeSelectedCity(event: any): void {
    const selectedprovinceid = Number(event.target.value);
    this.form.provinceid = selectedprovinceid;
    sessionStorage.setItem('provinceid', selectedprovinceid.toString());
    this.loadDistricts(selectedprovinceid);
  }

  changeSelectedDistrict(event: any): void {
    const selectedDistrictId = Number(event.target.value);
    this.form.districtId = selectedDistrictId;
    sessionStorage.setItem('districtId', selectedDistrictId.toString());
    this.loadWards(selectedDistrictId);
  }

  changeSelectedWard(event: any): void {
    this.form.wardId = Number(event.target.value);
  }

  checkField(index: number): void {
    const fieldId = this.fields[index].id || '';
    const provinceid = this.fields[index].provinceid || '';
    const districtId = this.fields[index].districtId || '';
    const wardId = this.fields[index].wardId || '';
    localStorage.setItem('fieldId', fieldId.toString()); 
    localStorage.setItem('provinceid', provinceid.toString());
    localStorage.setItem('districtId', districtId.toString());
    localStorage.setItem('wardId', wardId.toString());
    this.router.navigate(['/field/field-checking']);
  }
  
  
}
