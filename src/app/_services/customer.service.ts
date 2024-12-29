import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TtiCustomertype } from '../model/tticustomertypedto';
import { TtiOffice } from '../model/ttiofficedto';
import { API_PATH } from '../_services/hvnhconst';
import { Customer } from '../model/customer.model';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
const API_URL = API_PATH + '/customer/';
const API_URL_OFFICE = API_PATH + '/office/';
@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) { }
  findCustomertypeAll(): Observable<TtiCustomertype[]> {
    return this.http.get<TtiCustomertype[]>(
      API_URL + 'listcusttype',
      httpOptions
    );
  }

  findAllTtiOffice(offtype: String): Observable<TtiOffice[]> {
    return this.http.get<TtiOffice[]>(
      API_URL_OFFICE + 'listoffice?offtype=' + offtype,
      httpOptions
    );
  }

  findAllTtiOfficeBrcd(
    offtype: String,
    parentcd: string
  ): Observable<TtiOffice[]> {
    return this.http.get<TtiOffice[]>(
      API_URL_OFFICE +
      'listofficebrcd?parentcd=' +
      parentcd +
      '&offtype=' +
      offtype,
      httpOptions
    );
  }

  createCustomer(
    id: number,
    active: number,
    ticode: string,
    tmssobjectcode: string,
    custtpcd: string,
    fullname: string,
    shrtnm: string,
    gender: string,
    birthday: Date,
    birthplace: string,
    identificationno: string,
    issuedate: Date,
    idno: string,
    nationalityid: string,
    address: string,
    wardid: string,
    districtid: string,
    provinceid: string,
    countryid: string,
    countryName: string,
    tel: string,
    mobile: string,
    fax: string,
    email: string,
    website: string,
    taxcode: string,
    bankaccount: string,
    bankname: string,
    bankcode: string,
    contactname: string,
    contacttitle: string,
    contactmobile: string,
    contactaddress: string,
    contactemail: string,
    contactnote: string,
    agencycustomercode: string,
    note: string,
    agencycode: string,
    vinNo: string,
    engineNo: string,
    representativename: string,
    representativeaddress: string,
    representativetitle: string,
    representativemobile: string,
    representativenote: string,
    cmCode: string,
    commercialName: string,
    grade: string,
    gradePro: string,
    katashiky: string,
    lineoffDate: Date,
    provinceName: string,
    districtName: string,
    wardname: string,
    agencyname: string,
    isOverride: null | boolean
  ): Observable<any> {
    return this.http.post(
      API_URL + 'createcustomer',
      {
        id,
        active,
        ticode,
        tmssobjectcode,
        custtpcd,
        fullname,
        shrtnm,
        gender,
        birthday,
        birthplace,
        identificationno,
        issuedate,
        idno,
        nationalityid,
        address,
        wardid,
        districtid,
        provinceid,
        countryid,
        countryName,
        tel,
        mobile,
        fax,
        email,
        website,
        taxcode,
        bankaccount,
        bankname,
        bankcode,
        contactname,
        contacttitle,
        contactmobile,
        contactaddress,
        contactemail,
        contactnote,
        agencycustomercode,
        note,
        agencycode,
        vinNo,
        engineNo,
        representativename,
        representativeaddress,
        representativetitle,
        representativemobile,
        representativenote,
        cmCode,
        commercialName,
        grade,
        gradePro,
        katashiky,
        lineoffDate,
        provinceName,
        districtName,
        wardname,
        agencyname,
        isOverride,
      },
      httpOptions
    );
  }

  updateCustomer(
    id: number,
    active: number,
    ticode: string,
    tmssobjectcode: string,
    custtpcd: string,
    fullname: string,
    shrtnm: string,
    gender: string,
    birthday: Date,
    birthplace: string,
    identificationno: string,
    issuedate: Date,
    idno: string,
    nationalityid: string,
    address: string,
    wardid: string,
    districtid: string,
    provinceid: string,
    countryid: string,
    countryName: string,
    tel: string,
    mobile: string,
    fax: string,
    email: string,
    website: string,
    taxcode: string,
    bankaccount: string,
    bankname: string,
    bankcode: string,
    contactname: string,
    contacttitle: string,
    contactmobile: string,
    contactaddress: string,
    contactemail: string,
    contactnote: string,
    agencycustomercode: string,
    note: string,
    agencycode: string,
    vinNo: string,
    engineNo: string,
    representativename: string,
    representativeaddress: string,
    representativetitle: string,
    representativemobile: string,
    representativenote: string,
    cmCode: string,
    commercialName: string,
    grade: string,
    gradePro: string,
    katashiky: string,
    lineoffDate: Date,
    provinceName: string,
    districtName: string,
    wardname: string,
    agencyname: string,
    isOverride: null | boolean,
    createdDate?: Date,
    createdby?: string
  ): Observable<any> {
    return this.http.post(
      API_URL + 'updateCustomer',
      {
        id,
        active,
        ticode,
        tmssobjectcode,
        custtpcd,
        fullname,
        shrtnm,
        gender,
        birthday,
        birthplace,
        identificationno,
        issuedate,
        idno,
        nationalityid,
        address,
        wardid,
        districtid,
        provinceid,
        countryid,
        countryName,
        tel,
        mobile,
        fax,
        email,
        website,
        taxcode,
        bankaccount,
        bankname,
        bankcode,
        contactname,
        contacttitle,
        contactmobile,
        contactaddress,
        contactemail,
        contactnote,
        agencycustomercode,
        note,
        agencycode,
        vinNo,
        engineNo,
        representativename,
        representativeaddress,
        representativetitle,
        representativemobile,
        representativenote,
        cmCode,
        commercialName,
        grade,
        gradePro,
        katashiky,
        lineoffDate,
        provinceName,
        districtName,
        wardname,
        agencyname,
        isOverride,
        createdDate,
        createdby
      },
      httpOptions
    );
  }


  getPageCustomer(
    page?: number,
    custtpcd?: string,
    mobile?: string,
    tmssobjectcode?: string,
    ticode?: string,
    idno?: string,
    taxcode?: string,
    agencycustomercode?: string,
    fullname?: string,
    vinno?: string,
    engineno?: string,
    quotapolicyno?: string,
    cwdid?: string,
    agencycode?: string,
    licenseplates?: string,
    contactmobile?: string,
    quoteno?: string,
    contactname?: string,
  ): Observable<any> {
    return this.http.post<any>(
      API_URL + 'getAllCustomer',
      {
        page,
        custtpcd,
        mobile,
        tmssobjectcode,
        ticode,
        idno,
        taxcode,
        agencycustomercode,
        fullname,
        vinno,
        engineno,
        quotapolicyno,
        cwdid,
        agencycode,
        licenseplates,
        contactmobile,
        quoteno,
        contactname,
      },
      httpOptions
    );
  }

  deleteCustomer(id?: number): Observable<any> {
    return this.http.get(API_URL + 'deleteCustomer?id=' + id, httpOptions);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(API_URL + 'findbyid?id=' + id, httpOptions);
  }

  getFullVinInfo(vinNo: string, engineNo: string): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getFullVinInfo?vinNo=' + vinNo + '&engineNo=' + engineNo,
      httpOptions
    );
  }

  getFullVinInfoAndCustomerByVinnumberId(
    vinnumberid: number
  ): Observable<Customer> {
    return this.http.get<Customer>(
      API_URL +
      'getFullVinInfoAndCustomerByVinnumberId?vinnumberid=' +
      vinnumberid,
      httpOptions
    );
  }
  getFullVinInfoAndCustomerByVinnumberIdvsCust(
    vinnumberid: number,
    cusid: number,
  ): Observable<Customer> {
    return this.http.get<Customer>(
      API_URL +
      'getFullVinInfoAndCustomerByVinnumberId?vinnumberid=' +
      vinnumberid+ '&cusid=' + cusid,
      httpOptions
    );
  }
  getFullCustomerInfo(
    vinNoInput: string,
    dealerCodeInput: string,
    tenantCode: string
  ): Observable<any> {
    return this.http.get<any>(
      API_URL +
      'getCustomerInfo?vinNoInput=' +
      vinNoInput +
      '&dealerCodeInput=' +
      dealerCodeInput +
      '&tenantCode=' +
      tenantCode,
      httpOptions
    );
  }

  getFullCustomerInfoDB(
    textSearch: string,
    vinNo: string,
    engineNo: string,
    mobile: string
  ): Observable<any> {
    return this.http.get<any>(
      API_URL +
      'getCustomerInfoDB?textSearch=' +
      textSearch +
      '&vinNo=' +
      vinNo +
      '&engineNo=' +
      engineNo +
      '&mobile=' +
      mobile,
      httpOptions
    );
  }

  getCustomerByTextSearch(textSearch: string): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getCustomerByTextSearch?textSearch=' + textSearch,
      httpOptions
    );
  }

  getCustomerDetailByTiCode(tiCode: string): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getCustomerDetailByTiCode?tiCode=' + tiCode,
      httpOptions
    );
  }
  getCustomerDetailByVin(tiCode: string,vinNo?:string): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getCustomerDetailByVin?tiCode=' + tiCode+'&vinNo=' +
      vinNo,
      httpOptions
    );
  }

  addCusvin(
    cusno: string,
    vinno: string,
    engine: string,
    tenantcode: string,
    status: string,
    cmCode: string,
    katashiky: string,
    lineoffDate: Date,
    ticode: string,
    createdDate: Date,
    grade: string,
    gradePro: string,
    commercialName: string
  ): Observable<any> {
    return this.http.post(
      API_URL + 'addCusVin',
      {
        cusno,
        vinno,
        engine,
        tenantcode,
        status,
        cmCode,
        katashiky,
        lineoffDate,
        ticode,
        createdDate,
        grade,
        gradePro,
        commercialName,
      },
      httpOptions
    );
  }

  getListCusVin(ticode: string): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getListCusVin?ticode=' + ticode,
      httpOptions
    );
  }

  checkCusVinExist(
    vinno?: string,
    engine?: string,
    tenantcode?: string
  ): Observable<any> {
    return this.http.get(
      API_URL +
      'checkCusVinExist?vinno=' +
      vinno +
      '&engine=' +
      engine +
      '&tenantcode=' +
      tenantcode,
      httpOptions
    );
  }

  deleteCusVin(id?: number): Observable<any> {
    return this.http.get(
      API_URL + 'deleteCusVin?id=' + id + '&status=0',
      httpOptions
    );
  }

  undoDeleteCusVin(id?: number): Observable<any> {
    return this.http.get(
      API_URL + 'deleteCusVin?id=' + id + '&status=1',
      httpOptions
    );
  }

  findAllTtiOfficeBrcdagency(
    offtype: string,
    parentcd: string,
    agencycode: string
  ): Observable<TtiOffice[]> {
    return this.http.get<TtiOffice[]>(
      API_URL_OFFICE +
      'listofficebrcdagency?parentcd=' +
      parentcd +
      '&offtype=' +
      offtype +
      '&agencycode=' +
      agencycode,
      httpOptions
    );
  }

  compareTwoStringJaro(s1: string, s2: string) {
    // If the strings are equal
    if (s1 == s2)
      return 1.0;

    // Length of two strings
    var len1 = s1.length, len2 = s2.length;

    // Maximum distance upto which matching
    // is allowed
    var max_dist = Math.floor(Math.max(len1, len2) / 2) - 1;

    // Count of matches
    var match = 0;

    // Hash for matches
    var hash_s1 = Array(s1.length).fill(0);
    var hash_s2 = Array(s1.length).fill(0);

    // Traverse through the first string
    for (var i = 0; i < len1; i++) {

      // Check if there is any matches
      for (var j = Math.max(0, i - max_dist);
        j < Math.min(len2, i + max_dist + 1); j++)

        // If there is a match
        if (s1[i] == s2[j] && hash_s2[j] == 0) {
          hash_s1[i] = 1;
          hash_s2[j] = 1;
          match++;
          break;
        }
    }

    // If there is no match
    if (match == 0)
      return 0.0;

    // Number of transpositions
    var t = 0;

    var point = 0;

    // Count number of occurrences
    // where two characters match but
    // there is a third matched character
    // in between the indices
    for (var i = 0; i < len1; i++)
      if (hash_s1[i]) {

        // Find the next matched character
        // in second string
        while (hash_s2[point] == 0)
          point++;

        if (s1[i] != s2[point++])
          t++;
      }

    t /= 2;

    // Return the Jaro Similarity
    return ((match) / (len1)
      + (match) / (len2)
      + (match - t) / (match))
      / 3.0;
  }


  getKeyInfo(
    vinNoInput: string,
    tenantCode: string
  ): Observable<any> {
    return this.http.get<any>(
      API_URL + 'getKeyInfo?vinNoInput=' +vinNoInput + '&tenantCode=' +tenantCode,
      httpOptions
    );
  }

}
