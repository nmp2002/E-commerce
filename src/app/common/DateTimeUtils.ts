import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class DateTimeUtils {
  static convertStringToDate(str: any) {
    const [day, month, year] = str.split('/');
    const dateVal = new Date(+year, +month - 1, +day);
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      console.log('true');
      return dateVal;
    } else {
      console.log('false');
      return null;
    }
  }

  static convertStringToDate4(str: any) {
    const [day, month, year] = str.split('-');
    const dateVal = new Date(+year, +month - 1, +day);
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      console.log('true');
      return dateVal;
    } else {
      console.log('false');
      return null;
    }
  }

  static convertStringToDate5(str: any) {
    const [day, month, year] = str.split('-');
    const dateVal = new Date(+year, +month - 1, +day);

    return dateVal;

  }

  static convertStringToDate3(str: any) {
    const [day, month, year] = str.split('/');
    const dateVal = new Date(+year, +month - 1, +day);

    return dateVal;

  }

  static convertStringToDate2(str: any) {
    let myDate = '23012019'.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    str = str.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
    //let myDate = myDate1.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');

    var [year, month, day] = str.split('/');
    var dateVal = new Date(+year, +month - 1, +day);
    return dateVal;

  }

  static removeTime(val = new Date()) {
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  static removeTimeFromDate(val: any) {
    var dateVal = null;
    if (typeof val == "string") {
      dateVal = this.addTimeFromDate(val, "00:00:00");
    } else {
      var dateStr = moment(val).toDate();
      dateVal = this.addTimeFromDate(dateStr, "00:00:00");
    }
    return dateVal;
  }
  static removeTimeFromDate2(val: any):string {
    var dateVal = null;
    if (typeof val == "string") {
      dateVal = this.addTimeFromDate(val, "00:00:00");
    } else {
      var dateStr = moment(val).toDate();
      dateVal = this.addTimeFromDate(dateStr, "00:00:00");
    }
    return dateVal;
  }
  static addMinuteFromDate(val: any, minute: number) {
    if (val == null || val == undefined || val == '') {
      return null;
    }
    val.setMinutes(val.getMinutes() + minute);
    return val;
  }

  static addTimeFromDate(val: any, hhmmss: string) {
    if (val == null || val == undefined || val == '') {
      return null;
    }
    var [hours, minute, second] = hhmmss.split(':');
    if (typeof val == "string") {
      var [year, month, day] = val.split('-');
      val = new Date(+year, +month - 1, +day, Number(hours), Number(minute), Number(second));
    } else {
      val.setHours(0);
      val.setMinutes(0);
      val.setSeconds(0);
    }
    return val;
  }
  static addTimeFromDate2(val: any, hhmmss: string) {
    if (val == null || val == undefined || val == '') {
      return null;
    }
    alert('val');
    alert(val);
    var [hours, minute, second] = hhmmss.split(':');
    if (typeof val == "string") {
      alert(val);
      var [year, month, day] = val.split('-');
      val = new Date(+year, +month - 1, +day, Number(hours), Number(minute), Number(second));
    } else {
      val.setHours(0);
      val.setMinutes(0);
      val.setSeconds(0);
    }
    return val;
  }
  static getdays(datefrom: Date, dateto: Date) {
    const oneHour = 1 * 60 * 60 * 1000 * 24;

    // Calculating the time difference between two dates
    const diffInTime = dateto.getTime() - datefrom.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneHour);

    if (diffInDays < 0) {
      return diffInDays * -1
    }

    return diffInDays;
  }
  static getdays2(datefrom: Date, dateto: Date) {
    const oneHour = 1 * 60 * 60 * 1000 * 24;

    // Calculating the time difference between two dates
    const diffInTime = dateto.getTime() - datefrom.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneHour);

 
    return diffInDays;
  }
  static equalTwoDate(datefrom: Date, dateto: Date) {
    const oneHour = 1 * 60 * 60 * 1000 * 24;

    // Calculating the time difference between two dates
    const diffInTime = dateto.getTime() - datefrom.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneHour);

    return diffInDays;
  }

  static convertDateToString(date: Date, strSplit: string) {
    var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join(strSplit);
  }

  static convertDateToString_DD_MM_YYYY(date: Date, strSplit: string) {
    var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [day, month, year].join(strSplit);
  }

  static convertDateTimeToString(date: Date, strSplitddmmyyy: string, strSplithhmmss: string) {
    var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
    var hours = d.getHours(), minutes = d.getMinutes(), seconds = d.getSeconds();
    var hoursStr = '00', minutesStr = '00', secondsStr = '00';

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    if (hours.toString().length < 2) {
      hoursStr = '0' + hours;
    } else {
      hoursStr = hours.toString();
    }
    if (minutes.toString().length < 2) {
      minutesStr = '0' + minutes;
    } else {
      minutesStr = minutes.toString();
    }
    if (seconds.toString().length < 2) {
      secondsStr = '0' + seconds;
    } else {
      secondsStr = seconds.toString();
    }

    let ddmmyyyy = [day, month, year].join(strSplitddmmyyy);
    let hhmmss = [hoursStr, minutesStr, secondsStr].join(strSplithhmmss);
    return ddmmyyyy + ' ' + hhmmss;
  }

  /*function stringToDate(_date,_format,_delimiter) {
      var formatLowerCase=_format.toLowerCase();
      var formatItems=formatLowerCase.split(_delimiter);
      var dateItems=_date.split(_delimiter);
      var monthIndex=formatItems.indexOf("mm");
      var dayIndex=formatItems.indexOf("dd");
      var yearIndex=formatItems.indexOf("yyyy");
      var month=parseInt(dateItems[monthIndex]);
      month-=1;
      var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
      return formatedDate;
  }*/
}
