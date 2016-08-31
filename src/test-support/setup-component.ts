import { provideFakeRouter } from './mock-router';
import { provideFakeCms } from './mock-cms';

/**
 * Initialize the primary component to test in a spec
 *
 * TestBed needs to be setup all at once, so just queue everything up
 * for buildComponent to use.
 */
export function setupComponent(componentType) {
  beforeEach(() => {
    this._prxComponent = componentType;
    this._prxDeclarations = [componentType];
    this._prxProviders = [
      provideFakeRouter(componentType),
      provideFakeCms()
    ];
    this._prxOverrides = [];
  });
}
