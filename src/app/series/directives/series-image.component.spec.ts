import { cit, create, provide } from '../../../testing';
import { SeriesImageComponent } from './series-image.component';
import { TabService } from '../../shared';

describe('SeriesImageComponent', () => {

  create(SeriesImageComponent);

  provide(TabService);

  cit('renders an image uploader', (fix, el, comp) => {
    expect(el).not.toQuery('publish-image-upload');
    comp.series = {};
    fix.detectChanges();
    expect(el).toQuery('publish-image-upload');
    expect(el).toContainText('cover image');
  });

});
