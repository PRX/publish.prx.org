import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesImportComponent } from './series-import.component';

describe('SeriesImportComponent', () => {
  let component: SeriesImportComponent;
  let fixture: ComponentFixture<SeriesImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeriesImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
