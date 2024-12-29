import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NumberUtils {

    static convertStringToNumberByCurrency(dataval: string): string {
        let commasRemoved = dataval.replace(/,/g, '');
        let toInt: number;
        let toLocale: string;
        let datainput: string;
        if (commasRemoved.split('.').length > 1) {
            var vale1 = commasRemoved.split('.')[1];
            if (vale1 != '' && vale1.length > 2)
                vale1 = vale1.substring(0, 2);
            let decimal = isNaN(parseInt(vale1)) ? '' : parseInt(vale1);
            toInt = parseInt(commasRemoved);
            toLocale = toInt.toLocaleString('en-US') + '.' + decimal;
        } else {
            toInt = parseInt(commasRemoved);
            toLocale = toInt.toLocaleString('en-US');
        }
        if (toLocale === 'NaN') {
            datainput = '';
        } else {
            datainput = toLocale;
        }
        return datainput;
    }

    static convertNumberToStringByCurrency(dataval: number): string {
        return dataval.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
}