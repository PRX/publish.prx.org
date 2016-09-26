import { Component, Type, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { CmsService } from '../app/core/cms/cms.service';
import { MockCmsService } from './mock.cms.service';

interface ComponentTestCallback {
  (fix: ComponentFixture<any>, el: DebugElement, comp: any, done?: Function): any;
}

// component test-it up!
export function cit(desc: string, testFn: ComponentTestCallback) {
  return it(desc, function(done) {
    TestBed.configureTestingModule({
      declarations: this._publishDeclarations,
      providers:    this._publishProviders
    }).compileComponents();
    let fixture = TestBed.createComponent(this._publishComponent);
    fixture.detectChanges();
    if (testFn.length > 3) {
      testFn(fixture, fixture.debugElement, fixture.debugElement.componentInstance, done);
    } else {
      testFn(fixture, fixture.debugElement, fixture.debugElement.componentInstance);
      done();
    }
  });
}

// cms mocked in all component tests
let mockCms: MockCmsService;
export function currentCms() {
  return mockCms;
}

// create a component
export function create(componentType: Type<any>) {
  mockCms = new MockCmsService();
  beforeEach(function() {
    this._publishComponent    = componentType;
    this._publishDeclarations = [componentType];
    this._publishProviders    = [{provide: CmsService, useValue: mockCms}];
  });
}

// create a component inside a fake container-component
export function contain(componentType: Type<any>, componentProperties: any) {
  @Component(componentProperties)
  class TestContainerComponent {}
  create(TestContainerComponent);
  beforeEach(function() {
    this._publishDeclarations.push(componentType);
  });
}
