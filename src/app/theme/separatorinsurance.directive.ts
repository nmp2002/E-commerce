import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: 'input[separator]',
})
export class SeparatorinsuranceDirective {

  constructor(private _inputEl: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    if (this._inputEl.nativeElement.value === '-') return;
    let commasRemoved = this._inputEl.nativeElement.value.replace(/,/g, '');
    let toInt: number;
    let toLocale: string;

    if (commasRemoved.split('.').length > 1) {
          var vale1=  commasRemoved.split('.')[1];
     if(vale1!=''&& vale1.length>2)
       vale1=vale1.substring(0, 2);
       let decimal =isNaN(parseInt(vale1))? '':parseInt(vale1);
      toInt = parseInt(commasRemoved);
      toLocale = toInt.toLocaleString('en-US') + '.' + decimal;
    } else {
      toInt = parseInt(commasRemoved);
      toLocale = toInt.toLocaleString('en-US');
    }
    if (toLocale === 'NaN') {
      this._inputEl.nativeElement.value = '';
    } else {
      this._inputEl.nativeElement.value = toLocale;
    }
  }
}
