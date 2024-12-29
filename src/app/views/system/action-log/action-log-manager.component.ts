
import { Component, EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TblActionLogService } from '../../../_services/ActionLog.service';
import { TokenStorageService } from '../../../_services/token-storage.service';
import { TblActionLog } from '../../../model/TblActionLog';
import { ExportUtils } from '../../../common/ExportUtils';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateTimeUtils } from '../../../common/DateTimeUtils';

export interface todo {
  departmentCode: string;
  departmentName: string;
  id: number;
  status: string;
}

const noop = () => { };
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-tables',
  templateUrl: './action-log-manager.component.html'
})


export class ActionLogManagerComponent implements OnInit {

  public maskDate = {
    guide: true,
    showMask: true,
    // keepCharPositions : true,
    mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
  };

  form: any = {
    tableName: '',
    columnName: '',
    columnId: null,
    actionType: '',
    previous: '',
    next: '',
    fromDate: new Date,
    toDate: new Date,
  }

  private onChangeCallback: (_: any) => void = noop;

  constructor(private actionLogService: TblActionLogService,
    private tokenService: TokenStorageService,
    private exportUtils: ExportUtils,
    private activatedRoute: ActivatedRoute) { }

  actionLogs: TblActionLog[] = [];
  currentActionLog: TblActionLog = {};
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
  regexNumber = "^[0-9]*$";


  ngOnInit(): void {
    this.retrieveTutorials(1);
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();
  onChangeContractDate(event: any): void {
    this.form.fromDate = new Date(event.target.value);
  }

  onChangeToContractDate(event: any): void {
    this.form.toDate = new Date(event.target.value);
  }

  onBlur() {
    if (this.form.fromDate) {
      this.onChangeCallback(this.form.fromDate);
    }
    if (this.form.toDate) {
      this.onChangeCallback(this.form.toDate);
    }
  }

  onKeypressEvent(event: any): void {
    if (event.key != null && event.key != undefined && event.key != '') {
      if (!event.key.match(this.regexNumber)) {
        event.preventDefault();
      }
    }
  }

  findActionLog(): void {
    this.actionLogService.findActionLog(this.form.tableName, this.form.columnName, this.form.columnId == null ? 0 : this.form.columnId, this.form.actionType, this.form.previous, this.form.next, this.form.fromDate, this.form.toDate, 1, 10).subscribe({
      next: data => {
        this.actionLogs = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
      }, error: err => {}
    });
  }

  retrieveTutorials(page: number): void {
    this.actionLogService.findActionLog(this.form.tableName, this.form.columnName, this.form.columnId == null ? 0 : this.form.columnId, this.form.actionType, this.form.previous, this.form.next, this.form.fromDate, this.form.toDate, page, 10).subscribe({
      next: data => {
        this.actionLogs = data.content;
        this.count = data.totalElements;
        this.pageable = data.pageable;
        this.totalPages = data.totalPages;
        this.pageSize = data.size;
        this.isLast = data.isLast;
      }, error: err => {}
    });
  }

  exportExcel(): void {
    var fromDate = DateTimeUtils.convertDateToString_DD_MM_YYYY(this.form.fromDate, "/");
    var toDate = DateTimeUtils.convertDateToString_DD_MM_YYYY(this.form.toDate, "/");
    this.actionLogService.exportExcel(this.form.tableName, this.form.columnName, this.form.columnId == null ? 0 : this.form.columnId, this.form.actionType, this.form.previous, this.form.next, fromDate, toDate).subscribe({
      next: data => {
        this.exportUtils.downloadFileThenOpen(data.body, data.headers.get('content-type'), data.headers.get('content-disposition').split("filename=")[1], false);
      }, error: err => {
        alert("Có lỗi xảy ra trong quá trình xử lý !")
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
    this.currentActionLog = {};
    this.currentIndex = -1;
  }

  setActiveTutorial(dept: TblActionLog, index: number): void {
    this.currentActionLog = dept;
    this.currentIndex = index;
  }
}
