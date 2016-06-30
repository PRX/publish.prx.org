import {Component, Input, OnDestroy} from '@angular/core';

@Component({
  selector: 'spinner',
  styleUrls: ['app/shared/spinner/spinner.component.css'],
  template: `
    <div *ngIf="isSpinning" class="spinner" [class.inverse]="inverse"></div>
    `
})

export class SpinnerComponent implements OnDestroy {

  private currentTimeout: number;
  private isSpinning: boolean = true;

  @Input() public inverse: boolean = false;
  @Input() public delay: number = 300;

  @Input() public set spinning(value: boolean) {
    if (!value) {
      this.cancelTimeout();
      this.isSpinning = false;
    }
    if (this.currentTimeout) {
      return;
    }
    this.currentTimeout = setTimeout(() => {
      this.isSpinning = value;
      this.cancelTimeout();
    }, this.delay);
  }

  private cancelTimeout(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = undefined;
    }
  }

  ngOnDestroy(): any {
    this.cancelTimeout();
  }

}
