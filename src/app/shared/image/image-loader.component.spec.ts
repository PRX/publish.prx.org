import { cit, create, cms } from '../../../testing';
import { ImageLoaderComponent } from './image-loader.component';

describe('ImageLoaderComponent', () => {

  create(ImageLoaderComponent);

  const waitFor = (comp, event, callback) => {
    let originalFn = comp[event];
    spyOn(comp, event).and.callFake(function() {
      originalFn.apply(comp, arguments);
      callback();
    });
  };

  const getBackground = (el) => {
    let style = el.nativeElement.getAttribute('style') || '';
    let match = style.match(/background-image: url\((.+)\)/);
    return match ? match[1] : '';
  };

  const mockDoc = (linkHref) => {
    let doc = cms.mock('prx:anything', {});
    if (linkHref) {
      doc.mock('prx:image', {_links: {enclosure: {href: linkHref}}});
    }
    return doc;
  };

  describe('from src', () => {

    cit('renders the image src', (fix, el, comp, done) => {
      comp.src = 'http://placehold.it/10x10';
      waitFor(comp, 'onLoad', () => {
        expect(el).toQueryAttr('img', 'src', 'http://placehold.it/10x10');
        expect(getBackground(el)).toEqual('http://placehold.it/10x10');
        done();
      });
      fix.detectChanges();
    });

    cit('renders nothing if no src given', (fix, el, comp) => {
      expect(el).not.toQuery('img');
    });

    cit('renders an error for bad src', (fix, el, comp, done) => {
      comp.src = 'http://foo.bar/this/is/fake.jpg';
      waitFor(comp, 'onError', () => {
        expect(el).toQueryAttr('img', 'src', 'http://foo.bar/this/is/fake.jpg');
        expect(getBackground(el)).toContain(ImageLoaderComponent.PLACEHOLDER_ERROR);
        done();
      });
      fix.detectChanges();
    });

  });

  describe('from haldoc', () => {

    cit('follows the prx:image', (fix, el, comp, done) => {
      comp.imageDoc = mockDoc('http://placehold.it/10x10');
      waitFor(comp, 'onLoad', () => {
        expect(el).toQueryAttr('img', 'src', 'http://placehold.it/10x10');
        expect(getBackground(el)).toEqual('http://placehold.it/10x10');
        done();
      });

      // TODO: ngOnChanges not firing (https://github.com/angular/angular/issues/9866)
      comp.ngOnChanges({imageDoc: {currentValue: comp.imageDoc}});
      fix.detectChanges();
    });

    cit('shows a placeholder for missing images', (fix, el, comp, done) => {
      comp.imageDoc = mockDoc(null);
      waitFor(comp, 'onLoad', () => {
        expect(el).toQueryAttr('img', 'src', ImageLoaderComponent.PLACEHOLDER_IMAGE);
        expect(getBackground(el)).toContain(ImageLoaderComponent.PLACEHOLDER_IMAGE);
        done();
      });

      // TODO: ngOnChanges not firing (https://github.com/angular/angular/issues/9866)
      comp.ngOnChanges({imageDoc: {currentValue: comp.imageDoc}});
      fix.detectChanges();
    });

    cit('shows an error for bad enclosure href', (fix, el, comp, done) => {
      comp.imageDoc = mockDoc('http://foo.bar/this/is/fake.jpg');
      waitFor(comp, 'onError', () => {
        expect(el).toQueryAttr('img', 'src', 'http://foo.bar/this/is/fake.jpg');
        expect(getBackground(el)).toContain(ImageLoaderComponent.PLACEHOLDER_ERROR);
        done();
      });

      // TODO: ngOnChanges not firing (https://github.com/angular/angular/issues/9866)
      comp.ngOnChanges({imageDoc: {currentValue: comp.imageDoc}});
      fix.detectChanges();
    });

  });

});
