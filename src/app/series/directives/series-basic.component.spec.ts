import { cit, create, provide, By } from '../../../testing';
import { SeriesBasicComponent } from './series-basic.component';
import { TabService } from '../../shared';

describe('SeriesBasicComponent', () => {

  create(SeriesBasicComponent);

  provide(TabService);

  cit('does not render until the story is loaded', (fix, el, comp) => {
    expect(el).not.toQuery('publish-fancy-field');
    expect(el).not.toQuery('publish-wysiwyg');
    comp.series = {changed: () => false};
    fix.detectChanges();

    expect(el.queryAll(By.css('publish-fancy-field')).length).toEqual(3);
    expect(el).toContainText('name of your series');
    expect(el).toContainText('short description');
    expect(el).toContainText('cover image');
    expect(el.queryAll(By.css('publish-wysiwyg')).length).toEqual(1);
    expect(el).toContainText('full description');
  });

  cit('renders an image uploader', (fix, el, comp) => {
    expect(el).not.toQuery('publish-image-upload');
    comp.series = {changed: () => false};
    fix.detectChanges();
    expect(el).toQuery('publish-image-upload');
    expect(el).toContainText('cover image');
  });

});
