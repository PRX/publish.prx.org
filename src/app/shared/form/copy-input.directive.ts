import { Directive, ElementRef, Input, OnInit, HostListener } from '@angular/core';

@Directive({
  selector: '[publishCopyInput]'
})
export class CopyInputDirective implements OnInit {

  @Input() publishCopyInput: HTMLInputElement;

  private startText = 'Copy';
  private copiedText = 'Copied';

  constructor(private el: ElementRef) {}

  @HostListener('mouseover') onMouseOver(): void {
    this.el.nativeElement.innerHTML = this.startText;
  }

  @HostListener('click') onClick(): void {
    if (this.publishCopyInput && this.publishCopyInput.select) {
      this.publishCopyInput.select();
      try {
        document.execCommand('copy');
        this.publishCopyInput.blur();
        this.el.nativeElement.innerHTML = this.copiedText;
      } catch (err) {
        alert('Please press Ctrl/Cmd+C to copy');
      }
    }
  }

  ngOnInit() {
    this.startText = this.el.nativeElement.innerHTML;
  }

}
