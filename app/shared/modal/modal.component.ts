import {Component} from 'angular2/core';
import {ModalService, ModalState} from './modal.service';

@Component({
  selector: 'modal-box',
  styleUrls: ['app/shared/modal/modal.component.css'],
  template: `
    <div *ngIf="shown" class="overlay"></div>
    <div *ngIf="shown" class="modal">
      <button *ngIf="!state.buttons" class="close icon-cancel" (click)="close()"></button>
      <header *ngIf="state.title">
        <h1>{{state.title}}</h1>
      </header>
      <section *ngIf="state.body">
        <p>{{state.body}}</p>
      </section>
      <footer *ngIf="state.buttons">
        <button *ngFor="#label of state.buttons" [class]="buttonClass(label)"
          (click)="buttonClick(label)">{{label}}</button>
      </footer>
    </div>
    `
})

export class ModalComponent {

  private shown: boolean;
  private state: ModalState;

  constructor(modalService: ModalService) {
    modalService.state.subscribe((state) => {
      this.shown = !state.hide;
      if (state.hide) {
        this.setScroll(true);
      } else {
        this.setScroll(false);
      }
      this.state = state;
    });
  }

  buttonClass(label: string) {
    return 'button';
  }

  buttonClick(label: string) {
    if (this.state.buttonCallback) {
      this.state.buttonCallback(label);
    }
    this.close();
  }

  close() {
    this.shown = false;
    this.setScroll(true);
  }

  private setScroll(allowed: boolean) {
    if (allowed) {
      document.documentElement.style.overflow = 'auto';
    } else {
      document.documentElement.style.overflow = 'hidden';
    }
  }

}
