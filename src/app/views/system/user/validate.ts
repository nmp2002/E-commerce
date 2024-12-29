import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";


export function birthdayValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    const today = new Date().getFullYear();
    const birthday = parseDate(control.value).getFullYear();
    let age = today - birthday;
    if (age < 18 || age > 100) {
      return {'ageNotEnough': true};
    }
    return null;
  };
  function parseDate(str: string) {
    let dmy = str.split('-');
    return new Date(Number(dmy[0]), Number(dmy[1]) - 1, Number(dmy[2]));
  }
}
