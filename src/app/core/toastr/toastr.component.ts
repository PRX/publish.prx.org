import { Component } from '@angular/core';
import { ToastrService } from './toastr.service';

@Component({
  selector: 'publish-toastr',
  styleUrls: ['toastr.component.css'],
  template: `
    <div [class]="status" [class.show]="shown" (document:keydown)="onKey($event)">{{toastMessage}}</div>
    `
})

export class ToastrComponent {

  shown: boolean;
  toastMessage: string;
  status: string;

  constructor(toastrService: ToastrService) {
    toastrService.state.subscribe((toast) => {
      this.shown = true;
      this.toastMessage = toast.message;
      this.status = toast.status;

      setTimeout(() => { this.shown = false; }, 2500);
    });
  }

  onKey(event: KeyboardEvent) {
    if ((event.key && event.key === 'Escape') || event.keyCode === 27) {
      this.close();
    }
  }

  close() {
    this.shown = false;
  }

}
