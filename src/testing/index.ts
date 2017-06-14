/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import { MockHalService } from 'ngx-prx-styleguide';
import { currentHal } from './components';
import { matchers } from './matchers';

// custom jasmine matchers
beforeEach(() => jasmine.addMatchers(matchers));

// normal exports
export { cit, create, contain, direct, provide, stub, stubPipe } from './components';
export { findComponent, niceEl } from './helpers';
export { By } from '@angular/platform-browser';

// HACKY: export a getter to the current cms-mocks instance
export const cms: MockHalService = null;
Object.defineProperty(module.exports, 'cms', {
  get: () => currentHal() || new MockHalService()
});
