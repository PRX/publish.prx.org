import { TestBed } from '@angular/core/testing';

/**
 * Build a component and wait for it to render
 */
export function buildComponent(callback) {
  return () => {
    TestBed.configureTestingModule({
      declarations: this._prxDeclarations,
      providers: this._prxProviders
    });

    for (let override of this._prxOverrides) {
      TestBed.overrideComponent(override[0], override[1]);
      TestBed.overrideDirective(override[0], override[1]);
    }

    TestBed.compileComponents().then(
      () => {
        let fixture = TestBed.createComponent(this._prxComponent);
        return fixture.whenStable().then(() => {
          fixture.autoDetectChanges();
          return callback(fixture, fixture.nativeElement, fixture.componentInstance);
        });
      }
    );
  };
}
