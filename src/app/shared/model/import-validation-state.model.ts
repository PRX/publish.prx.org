import { HalDoc } from '../../core';

export interface PodcastImportValidatorHalDoc extends Request {
    feed: object;
}

export class ImportValidationState {

  validatingImportUrlComplete = false;
  validatingImportUrl = false;
  invalidImportUrl = false;
  feed: object = null;

  complete() {
    return this.validatingImportUrlComplete;
  }

  validating() {
    return this.validatingImportUrl;
  }

  valid() {
    return !this.invalidImportUrl && this.validatingImportUrlComplete;
  }

  invalid() {
    return this.invalidImportUrl && this.validatingImportUrlComplete;
  }

  needsValidation() {
    return !this.complete() && !this.validating();
  }

  setStartValidating() {
    this.validatingImportUrl = true;
  }

  setValid(verified: PodcastImportValidatorHalDoc) {
    this.validatingImportUrl = false;
    this.validatingImportUrlComplete = true;
    this.invalidImportUrl = false;
    this.feed = verified.feed;
  }

  setInvalid() {
    this.validatingImportUrl = false;
    this.validatingImportUrlComplete = true;
    this.invalidImportUrl = true;
    this.feed = null;
  }

}
