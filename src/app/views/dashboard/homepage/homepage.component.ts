import { Component, OnInit } from '@angular/core';
import { FieldService } from '../../../_services/field.service';
import { TblCity } from '../../../model/tblCity';
import { TblDistrict } from '../../../model/tblDistrict';
import { TblWard } from '../../../model/tblWard';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  fields: any[] = [];
  tblCity: TblCity[];
  tblDistrict: TblDistrict[];
  tblWard: TblWard[];
  form: any = {
    provinceid: '',
    wardId: '',
    districtId: '',
    fieldName: '',
    status: '' // thêm trường này
  };

  constructor(
    private fieldService: FieldService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.fieldService.getCities().subscribe((data: TblCity[]) => {
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
    const saveWardId = sessionStorage.getItem('wardId');
    if (saveWardId) {
      this.form.wardId = Number(saveWardId);
    }
  }

  loadDistricts(provinceid: number): void {
    if (provinceid) {
      this.fieldService.getDistrictsByCityId(provinceid).subscribe((data: TblDistrict[]) => {
        this.tblDistrict = data.filter(ob => ob.active === '1');
        this.tblWard = [];
      });
    }
  }

  loadWards(districtId: number): void {
    if (districtId) {
      this.fieldService.getWardsByDistrictId(districtId).subscribe((data: TblWard[]) => {
        this.tblWard = data.filter(ob => ob.active === '1');
      });
    }
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
    const selectedWardId = Number(event.target.value);
    this.form.wardId = selectedWardId;
    sessionStorage.setItem('wardId', selectedWardId.toString());
}


  onSubmit(): void {
    sessionStorage.setItem('searchFormData', JSON.stringify(this.form));
    this.router.navigate(['/dashboard/search-field-result']);
  }
  

  deleteField(field: any): void {
    if (confirm('Bạn có chắc chắn muốn xóa field này?')) {
      this.fieldService.deleteField(field.id).subscribe(
        response => {
          this.onSubmit();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  encryptData(id: number): string {
    return btoa(id.toString());
  }
}
