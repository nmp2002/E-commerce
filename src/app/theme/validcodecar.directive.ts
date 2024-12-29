import { Directive, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[valid-code]',
})
export class ValidCodeCarDirective implements OnInit {
  constructor() {}

  ngOnInit() {}

  @HostListener('input', ['$event'])
  inputEvent(event: KeyboardEvent) {
    var str = '';
    const input = event.target as HTMLInputElement;
    str = input.value;
    input.value = str.replace(/[^a-zA-Z0-9-_]+/g, '').toUpperCase();
  }
}
