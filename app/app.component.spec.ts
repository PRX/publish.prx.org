import { it, describe, expect, beforeEachProviders, inject } from 'angular2/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEachProviders(() => [ AppComponent ]);

  it('should be instantiated and injected', inject([AppComponent], (appComponent: AppComponent) => {
    expect(appComponent).toBeAnInstanceOf(AppComponent);
  }));

});
