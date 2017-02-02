import { Component } from '@angular/core';
import { ModalService, ModalState } from './modal.service';

@Component({
  selector: 'publish-modal',
  styleUrls: ['modal.component.css'],
  template: `
    <div *ngIf="shown" class="overlay" (document:keydown)="onKey($event)"></div>
    <div *ngIf="shown" class="modal"
      [style.height.px]="state.height" [style.marginTop.px]="-state.height / 2"
      [style.width.px]="state.width" [style.marginLeft.px]="-state.width / 2">
      <button *ngIf="!state.primaryButton && !state.secondaryButton" class="close icon-cancel" (click)="close()"></button>
      <header *ngIf="state.title">
        <h1>{{state.title}}</h1>
      </header>
      <section *ngIf="state.body" [innerHTML]="state.body">
      </section>
      <footer *ngIf="state.primaryButton || state.secondaryButton">
        <button *ngIf="state.primaryButton" class="button primary"
          (click)="buttonClick(state.primaryButton)">{{state.primaryButton}}</button>
        <button *ngIf="state.secondaryButton" class="button secondary"
          (click)="buttonClick(state.secondaryButton)">{{state.secondaryButton}}</button>
      </footer>
    </div>
    `
})

export class ModalComponent {

  shown: boolean;
  state: ModalState;

  constructor(modalService: ModalService) {
    modalService.state.subscribe((state) => {
      this.shown = !state.hide;
      if (state.hide) {
        this.setScroll(true);
      } else {
        this.setScroll(false);
      }
      this.state = Object.assign({}, state);
    });
  }

  onKey(event: KeyboardEvent) {
    if ((event.key && event.key === 'Escape') || event.keyCode === 27) {
      this.state.secondaryButton ? this.buttonClick(this.state.secondaryButton) : this.close();
    } else if ((event.key && event.key === 'Enter') || event.keyCode === 13) {
      this.state.primaryButton ? this.buttonClick(this.state.primaryButton) : this.close();
    }
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
