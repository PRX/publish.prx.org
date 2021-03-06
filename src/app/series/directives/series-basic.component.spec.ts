import { cit, create, provide, By, cms } from '../../../testing';
import { RouterStub, ActivatedRouteStub } from '../../../testing/stub.router';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesBasicComponent } from './series-basic.component';
import { SeriesComponent } from '../series.component';
import { ModalService, TabService, ToastrService } from 'ngx-prx-styleguide';

const activatedRoute = new ActivatedRouteStub();
const router = new RouterStub();

describe('SeriesBasicComponent', () => {
  create(SeriesBasicComponent);

  provide(TabService);
  provide(Router, router);
  provide(ActivatedRoute, activatedRoute);
  provide(ModalService);
  provide(ToastrService, { success: () => {} });
  provide(SeriesComponent);

  beforeEach(() => {
    const auth = cms().mock('prx:authorization', {});
    auth.mockItems('prx:accounts', [
      { name: 'TheAccountName', type: 'IndividualAccount', id: 111 },
      { name: 'DefaultName', type: 'DefaultAccount', id: 222 }
    ]);
  });

  cit('does not render until the series is loaded', (fix, el, comp) => {
    expect(el).not.toQuery('prx-fancy-field');
    expect(el).not.toQuery('publish-wysiwyg');
    comp.series = {
      changed: () => false,
      account: { name: 'DefaultAccount', id: '222' }
    };
    fix.detectChanges();

    expect(el.queryAll(By.css('prx-fancy-field')).length).toEqual(7);
    expect(el).toContainText('Who is the owner');
    expect(el).toContainText('name of this series');
    expect(el).toContainText('short description');
    expect(el).toContainText('full description');
    expect(el).toContainText('cover image');
    expect(el.queryAll(By.css('publish-wysiwyg')).length).toEqual(1);
    expect(el).toContainText('full description');
  });

  cit('renders image uploaders', (fix, el, comp) => {
    expect(el).not.toQuery('publish-image-upload');
    comp.series = {
      changed: () => false,
      account: { name: 'DefaultAccount', id: '222' }
    };
    fix.detectChanges();
    expect(el).toQuery('publish-image-upload');
    expect(el).toContainText('cover image');
  });

  cit('when user has access to more than one account, allows setting owner for series', (fix, el, comp) => {
    comp.series = { isNew: true, changed: () => false, account: { name: 'DefaultAccount', id: '222' } };
    fix.detectChanges();
    expect(el).toContainText('Who is the owner');
  });
});
