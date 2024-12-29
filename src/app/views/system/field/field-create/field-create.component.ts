import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { TblField } from '../../../../model/tblField';
import { FieldService } from '../../../../_services/field.service';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { TblCity } from '../../../../model/tblCity';
import { TblDistrict } from '../../../../model/tblDistrict';
import { TblWard } from '../../../../model/tblWard';
import { TblSupplier } from '../../../../model/TblSupplier';
import { TblFieldType } from '../../../../model/tblFieldType';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { SupplierService } from 'src/app/_services/supplier.service';
@Component({
  selector: 'app-field-create',
  templateUrl: './field-create.component.html',
  styleUrls: ['./field-create.component.scss'],
})
export class FieldCreateComponent implements OnInit {
  selectedImages: File[] = [];
  tblField: TblField[];
  tblCity: TblCity[];
  tblDistrict: TblDistrict[];
  tblWard: TblWard[];
  tblSupplier: TblSupplier[];
  tblFieldType: TblFieldType[];
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
    fieldType: '',
    supplierId: '',
    supplierName: '',
    address: '',
    image: ''
  };

  constructor(
    private fieldService: FieldService,
    private supplierService:SupplierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }
  ngOnDestroy(): void {
 
    sessionStorage.removeItem('provinceid');
    sessionStorage.removeItem('districtId');
    sessionStorage.removeItem('wardId');
    console.log('Cleared session storage values.');
  }
  loadInitialData(): void {
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
      const id = data.get('id');
      if (id) {
        const decodedId = atob(id); // Giải mã hóa ID nếu cần thiết
        if (!isNaN(Number(decodedId))) { // Kiểm tra ID có phải là số hay không
          this.form.id = decodedId;
          console.log("id", this.form.id);
          this.fieldService.findByIdField(Number(decodedId)).subscribe(data => {
            this.form = data;
            this.isUpdate = true;
            this.loadDistricts(this.form.provinceid);
            this.loadWards(this.form.districtId);
            this.loadFieldTypes(Number(decodedId));
          });
        } else {
          console.error('Invalid ID:', id);
          // Xử lý ID không hợp lệ ở đây
        }
      }
    });
  
    this.fieldService.getSupplier().subscribe(allSuppliers => {
      const authUserJson = sessionStorage.getItem('auth-user');
      let username: string | null = null;
    
      if (authUserJson) {
        try {
          const authUser = JSON.parse(authUserJson);
          username = authUser.username;
          console.log('Username từ auth-user:', username); 
        } catch (error) {
          console.error('Lỗi phân tích cú pháp auth-user:', error);
        }
      }
      if (username) {
        const matchingSupplier = allSuppliers.find(supplier => supplier.supplierNameLogin === username);
        if (matchingSupplier) {
          this.tblSupplier = [matchingSupplier];
        } else {
          this.tblSupplier = allSuppliers;
        }
      } else {
        this.tblSupplier = allSuppliers;
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
    const savedWardId = sessionStorage.getItem('wardId');
    this.form.wardId = Number(savedWardId);
    this.tblFieldType = [
      { fieldTypeId: 1, fieldTypeName: 'Loại 5' },
      { fieldTypeId: 2, fieldTypeName: 'Loại 7' },
      { fieldTypeId: 3, fieldTypeName: 'Loại 9' },
      { fieldTypeId: 4, fieldTypeName: 'Loại 11' },
    ];
    this.tblFieldType.forEach(fieldType => {
      this.form['field' + fieldType.fieldTypeId] = 0;
    });
  }
  

  loadFieldTypes(fieldId: number): void {
    // Trước khi gọi API, gán giá trị mặc định là 0 cho tất cả các fieldType
    this.tblFieldType.forEach(fieldType => {
      this.form['field' + fieldType.fieldTypeId] = 0;
    });
  
    this.fieldService.getFieldTypebyFieldId(fieldId).subscribe(fieldTypes => {
      // Duyệt qua từng fieldType từ API để cập nhật giá trị vào form
      fieldTypes.forEach(ft => {
        const foundFieldType = this.tblFieldType.find(type => type.fieldTypeName === ft.fieldTypeName);
        if (foundFieldType) {
          // Nếu tìm thấy fieldType trong tblFieldType, cập nhật giá trị từ API vào form dựa trên fieldTypeId
          this.form['field' + foundFieldType.fieldTypeId] = ft.totalNumberField || 0;
        }
      });
    });
  }
  
  
  
  loadDistricts(provinceid: number): void {
    if (provinceid) {
      this.fieldService.getDistrictsByCityId(provinceid).subscribe(data => {
        this.tblDistrict = data.filter(ob => ob.active === '1');
        this.tblWard = [];
      });
    }
  }

  loadCity(provinceid: number): void {
    if (provinceid) {
      this.fieldService.getCityById(provinceid).subscribe(data => {
        this.tblDistrict = data.filter(ob => ob.active === '1');
        this.tblWard = [];
      });
    }
  }
  loadWards(districtId: number): void {
    if (districtId) {
      this.fieldService.getWardsByDistrictId(districtId).subscribe(data => {
        this.tblWard = data.filter(ob => ob.active === '1');
      });
    }
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const selectedProvince = this.tblCity.find(city => city.provinceid === this.form.provinceid);
      const selectedDistrict = this.tblDistrict.find(district => district.districtId === this.form.districtId);
      const selectedWard = this.tblWard.find(ward => ward.wardId === this.form.wardId);
      const selectedSupplier = this.tblSupplier.find(supplier => supplier.supplierId === this.form.supplierId);
      const fieldData = {
        id: this.form.id,
        provinceid: this.form.provinceid,
        districtId: this.form.districtId,
        wardId: this.form.wardId,
        fieldName: this.form.fieldName,
        fieldType: this.form.fieldType,
        supplierId: this.form.supplierId,
        supplierName: selectedSupplier ? selectedSupplier.supplierName : '',
        provinceName: selectedProvince ? selectedProvince.provinceName : '',
        districtName: selectedDistrict ? selectedDistrict.districtName : '',
        wardName: selectedWard ? selectedWard.wardName : '',
        phoneNumberField: this.form.phoneNumberField,
        day: new Date(this.form.day),
        timeStart: new Date(this.form.timeStart),
        timeEnd: new Date(this.form.timeEnd),
        address: this.form.address,
        image: this.form.image
      };
  
      // Lưu dữ liệu field vào bảng tblField
      this.fieldService.createOrUpdateField(
        fieldData.id,
        fieldData.provinceid,
        fieldData.districtId,
        fieldData.wardId,
        fieldData.fieldName,
        fieldData.provinceName || '',
        fieldData.districtName || '',
        fieldData.wardName || '',
        fieldData.fieldType,
        fieldData.supplierId,
        fieldData.supplierName || '',
        fieldData.phoneNumberField,
        fieldData.day,
        fieldData.timeStart,
        fieldData.timeEnd,
        fieldData.address,
        fieldData.image,
        this.isUpdate,
      ).subscribe({
        next: (response) => {
          console.log('Field saved successfully', response);
          console.log('Field Data:', fieldData);

          // Thông báo thành công
          Notify.success('Field saved successfully', {
            success: {
              childClassName: 'notiflix-notify-success'
            }
          });
  
          // Lặp qua các fieldType để lưu hoặc cập nhật
          const updatedFieldTypes: string[] = [];
          this.tblFieldType.forEach(fieldType => {
            const fieldTypeName = fieldType.fieldTypeName;
            const totalNumberField = this.form['field' + fieldType.fieldTypeId];
            
            // Nếu tồn tại fieldTypeName trong tblFieldType và là lần đầu thêm vào updatedFieldTypes
            if (fieldTypeName && totalNumberField !== undefined && totalNumberField !== null && totalNumberField > 0 && updatedFieldTypes.indexOf(fieldTypeName) === -1) {
              updatedFieldTypes.push(fieldTypeName); // Thêm fieldTypeName vào updatedFieldTypes
              const fieldId = this.isUpdate ? this.form.id : response.id;
              this.fieldService.saveOrUpdateFieldType(fieldId, fieldTypeName, totalNumberField).subscribe({
                next: (response: any) => {
                  console.log('Field type saved or updated successfully', response);
                },
                error: (err: any) => {
                  console.error('Error saving or updating field type', err);
                }
              });
            }
          });
  
          this.router.navigate(['/field/field-manager']);
        },
        error: (err) => {
          console.error('Error saving field', err);
          // Thông báo lỗi
          Notify.failure('Error saving field', {
            failure: {
              childClassName: 'notiflix-notify-failure'
            }
          });
        }
      });
    } else {
      console.error('Form is not valid', form);
      // Thông báo form không hợp lệ
      Notify.failure('Form is not valid', {
        failure: {
          childClassName: 'notiflix-notify-failure'
        }
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
    this.form.wardId = Number(event.target.value);
  }

  changeSelectedSupplier(event: any): void {
    this.form.supplierId = Number(event.target.value);
  }
  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Lấy kết quả từ FileReader và chuyển đổi thành chuỗi base64
        const base64result: string = e.target.result.toString().split(',')[1];
        if (base64result) {
          this.form.image = base64result; // Lưu chuỗi base64 vào form
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  

  
}
