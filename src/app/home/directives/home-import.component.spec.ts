import { cit, create, cms, provide } from '../../../testing';
import { MockHalDoc, ToastrService } from 'ngx-prx-styleguide';
import { HomeImportComponent } from './home-import.component';
import { CmsService } from '../../core/hal/';

describe('HomeImportComponent', () => {

  create(HomeImportComponent, false);

  let toastErrorMsg: any;
  provide(ToastrService, { success: () => {}, error: (msg) => toastErrorMsg = msg });

  let auth;
  beforeEach(() => {
    auth = cms.mock('prx:authorization', {});
    auth.mockItems('prx:podcast-imports', []);
  });


  cit('displays nothing if a user has no imports', (fix, el, comp) => {
    comp.auth = auth;
    fix.detectChanges();
    expect(el).not.toContainText('Series Import');
  });

});
