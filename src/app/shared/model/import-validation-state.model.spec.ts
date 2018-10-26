import { ImportValidationState } from './import-validation-state.model';

class MockHalDoc {

  feed: any;

  constructor(mockFeed){
    this.feed = mockFeed;
  }
}

describe('ImportValidationState', () => {

  let importUrlValidation: any;

  let reInit = () => {
    importUrlValidation = new ImportValidationState();
  };

  beforeEach(() => {
    reInit();
  });

  it('instantiates a new import validation state', () => {
    expect(importUrlValidation && true).toEqual(true);

    expect(importUrlValidation.valid()).toEqual(false);
    expect(importUrlValidation.invalid()).toEqual(false);
    expect(importUrlValidation.validating()).toEqual(false);
    expect(importUrlValidation.complete()).toEqual(false);
    expect(importUrlValidation.needsValidation()).toEqual(true);

    expect(importUrlValidation.feed).toEqual(null);
  });

  it('can start validating', () => {
    importUrlValidation.setStartValidating();

    expect(importUrlValidation.validating()).toEqual(true);
    expect(importUrlValidation.valid()).toEqual(false);
    expect(importUrlValidation.invalid()).toEqual(false);
    expect(importUrlValidation.complete()).toEqual(false);
    expect(importUrlValidation.needsValidation()).toEqual(false);

    expect(importUrlValidation.feed).toEqual(null);
  });

  it('can set a valid state', () => {
    importUrlValidation.setValid(new MockHalDoc({some: 'doc'}));

    expect(importUrlValidation.validating()).toEqual(false);
    expect(importUrlValidation.valid()).toEqual(true);
    expect(importUrlValidation.invalid()).toEqual(false);
    expect(importUrlValidation.complete()).toEqual(true);
    expect(importUrlValidation.needsValidation()).toEqual(false);

    expect(importUrlValidation.feed).toEqual({some: 'doc'});
  });

  it('can set an inalid state', () => {
    importUrlValidation.setInvalid();

    expect(importUrlValidation.validating()).toEqual(false);
    expect(importUrlValidation.valid()).toEqual(false);
    expect(importUrlValidation.invalid()).toEqual(true);
    expect(importUrlValidation.complete()).toEqual(true);
    expect(importUrlValidation.needsValidation()).toEqual(false);

    expect(importUrlValidation.feed).toEqual(null);
  });

  it('can alternate between invalid and valid', () => {
    importUrlValidation.setValid(new MockHalDoc({some: 'doc'}));

    importUrlValidation.setInvalid();

    // same as "invalid state"
    expect(importUrlValidation.validating()).toEqual(false);
    expect(importUrlValidation.valid()).toEqual(false);
    expect(importUrlValidation.invalid()).toEqual(true);
    expect(importUrlValidation.complete()).toEqual(true);
    expect(importUrlValidation.needsValidation()).toEqual(false);

    expect(importUrlValidation.feed).toEqual(null);
  });

  it('can describe if we need validating', () => {
    expect(importUrlValidation.needsValidation()).toEqual(true);

    importUrlValidation.setValid(new MockHalDoc({some: 'doc'}));

    expect(importUrlValidation.needsValidation()).toEqual(false);

    // wipe the state of the validation state machine
    reInit();

    expect(importUrlValidation.needsValidation()).toEqual(true);

    importUrlValidation.setInvalid();

    expect(importUrlValidation.needsValidation()).toEqual(false);
  });




});

