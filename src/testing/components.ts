import { Component, Type, DebugElement, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';

import { CmsService } from '../app/core/cms/cms.service';
import { MockCmsService } from './mock.cms.service';
import { StubRouterLinkDirective } from './stub.routerlink.directive';

interface ComponentTestCallback {
  (fix: ComponentFixture<any>, el: DebugElement, comp: any, done?: Function): any;
}

// component test-it up!
export function cit(desc: string, testFn: ComponentTestCallback) {
  return it(desc, function(done) {
    TestBed.configureTestingModule({
      declarations: this._publishDeclarations,
      imports:      [FormsModule],
      providers:    this._publishProviders,
      schemas:      [NO_ERRORS_SCHEMA]
    }).compileComponents();
    let fixture = TestBed.createComponent(this._publishComponent);
    if (this._publishInitDetect) {
      fixture.detectChanges();
    }
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
export function create(componentType: Type<any>, runInitialDetect = true) {
  mockCms = new MockCmsService();
  beforeEach(function() {
    this._publishComponent    = componentType;
    this._publishDeclarations = [componentType, StubRouterLinkDirective];
    this._publishProviders    = [{provide: CmsService, useValue: mockCms}];
    this._publishInitDetect   = runInitialDetect;
  });
}

// create a component inside a fake container-component
export function contain(componentType: Type<any>, componentProperties: any, typeClass?: any) {
  @Component(componentProperties)
  class TestContainerComponent {}
  create(TestContainerComponent);
  beforeEach(function() {
    this._publishDeclarations.push(componentType);
  });
}

// declare a directive dependency
export function direct(directiveType) {
  beforeEach(function() {
    this._publishDeclarations.push(directiveType);
  });
}

// ad-hoc providers
export function provide(provider, useValue?) {
  beforeEach(function() {
    if (useValue) {
      if (useValue instanceof Type) {
        this._publishProviders.push({provide: provider, useClass: useValue});
      } else {
        this._publishProviders.push({provide: provider, useValue: useValue});
      }
    } else {
      this._publishProviders.push(provider);
    }
  });
}

// stub a selector
export function stub(selectorOrProperties) {
  if (typeof(selectorOrProperties) === 'string') {
    selectorOrProperties = {selector: selectorOrProperties, template: 'stubbed'};
  }
  @Component(selectorOrProperties)
  class TestStubComponent {}
  beforeEach(function() {
    this._publishDeclarations.push(TestStubComponent);
  });
}

// stub a pipe
export function stubPipe(name, transformFn?) {
  @Pipe({name: name})
  class TestStubPipe implements PipeTransform {
    transform(val: any): any {
      return transformFn ? transformFn(val) : `${val}`;
    }
  }
  beforeEach(function() {
    this._publishDeclarations.push(TestStubPipe);
  });
}
