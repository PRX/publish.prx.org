/*
 * Mock a service provider each time the test module is built
 */
export function mockService(serviceType, mockWith: {}) {
  beforeEach(() => {
    this._prxProviders.push({
      provide: serviceType,
      useValue: mockWith
    });
  });
}
