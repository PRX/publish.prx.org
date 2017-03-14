import { Injectable, ErrorHandler } from '@angular/core';
import { ModalService } from '../core';

@Injectable()
export class ErrorService implements ErrorHandler {

  private defaultHandler: ErrorHandler;

  constructor(private modal: ModalService) {
    this.defaultHandler = new ErrorHandler(false); // don't re-throw
  }

  handleError(err) {
    console.log('-- i am handling it okay? --');
    this.modal.show({
      title: 'Uncaught ' + (err.name || 'Error'),
      body: `
        <p>${err.message}</p>
        <hr/>
        <pre>${err.stack}</pre>
      `,
      secondaryButton: 'Okay',
      height: 400,
      width: 700
    });
    this.defaultHandler.handleError(err);
  }

}
