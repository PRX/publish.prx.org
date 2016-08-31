import { Component } from '@angular/core';
import { ModalService, ModalState } from './modal.service';

@Component({
  selector: 'modal-box',
  styleUrls: ['modal.component.css'],
  template: `
    <div *ngIf="shown" class="overlay" (document:keyup)="onKey($event)"></div>
    <div *ngIf="shown" class="modal">
      <button *ngIf="!state.buttons" class="close icon-cancel" (click)="close()"></button>
      <header *ngIf="state.title">
        <h1>{{state.title}}</h1>
      </header>
      <section *ngIf="state.body">
        <p [innerHTML]="state.body"></p>
      </section>
      <footer *ngIf="state.buttons">
        <button *ngFor="let label of state.buttons" [class]="buttonClass(label)"
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

  onKey(event: KeyboardEvent) {
    if ((event.key && event.key === 'Escape') || event.keyCode === 27) {
      let cancel = (this.state.buttons || []).find(name => {
        return ['cancel', 'no', 'nope'].indexOf(name.toLowerCase()) > -1;
      });
      cancel ? this.buttonClick(cancel) : this.close();
    } else if ((event.key && event.key === 'Enter') || event.keyCode === 13) {
      let okay = (this.state.buttons || []).find(name => {
        return ['ok', 'okay', 'yes'].indexOf(name.toLowerCase()) > -1;
      });
      okay ? this.buttonClick(okay) : this.close();
    }
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
