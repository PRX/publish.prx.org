import { provide } from 'angular2/core';
import { it, describe, expect, beforeEach, beforeEachProviders, inject, injectAsync } from 'angular2/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEachProviders(() => [ AppComponent ]);

  it('should be instantiated and injected', inject([AppComponent], (appComponent: AppComponent) => {
    expect(appComponent).toBeAnInstanceOf(AppComponent);
  }));

});
