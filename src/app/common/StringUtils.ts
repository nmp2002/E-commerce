import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StringUtils {

    static replaceStrAtPosition(str: string, strCut: string, strReplace: string, posReplace: number): string {
        let result: string = '';
        if (str != null && str != undefined && str != '') {
            const strArr = str.split(strCut);
            if (strArr != null && strArr != undefined && strArr.length >= posReplace) {
                for (let i = 0; i < strArr.length; i++) {
                    if (i > 0) {
                        if (i == posReplace) {
                            result = result.concat(strCut).concat(strReplace);
                        } else {
                            result = result.concat(strCut).concat(strArr[i]);
                        }
                    } else {
                        if (i == posReplace) {
                            result = result.concat(strReplace);
                        } else {
                            result = result.concat(strArr[i]);
                        }
                    }
                }
            }
        }

        return result;
    }
}