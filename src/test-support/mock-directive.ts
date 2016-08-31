/*
 * Mock a service provider each time the test module is built
 */
export function mockDirective(directiveType, setOverrides: {}) {
  beforeEach(() => {
    this._prxOverrides.push([directiveType, {set: setOverrides}]);
  });
}
