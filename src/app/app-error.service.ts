import { Injectable, ErrorHandler } from '@angular/core';
import { ModalService } from './core';

@Injectable()
export class AppErrorService implements ErrorHandler {

  private defaultHandler: ErrorHandler;

  constructor(private modal: ModalService) {
    this.defaultHandler = new ErrorHandler(false); // don't re-throw
  }

  handleError(err) {
    this.modal.show({
      title: 'Uncaught ' + (err.name || 'Error'),
      body: `
        <p>${err.message}</p>
        <hr/>
        <pre style="font-size:12px;line-height:16px;white-space:pre">${err.stack}</pre>
      `,
      buttons: ['Okay'],
      height: 400,
      width: 700
    });
    this.defaultHandler.handleError(err);
  }

}
