import { cit, create, provide } from '../../../testing';
import { ImageUploadComponent } from './image-upload.component';
import { UploadService } from '../../core/upload/upload.service';

describe('ImageUploadComponent', () => {

  create(ImageUploadComponent);

  provide(UploadService, {add: () => null});

  let imageDataURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAMAAAC/MqoPAAAABGdBTUEAALGPC/xhBQAAAAFzUkd\
    CAK7OHOkAAAKIUExURUxpcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwMsT0AAADXdFJOUwD5Af42BwYC/fjJf/wD+wQ\
    KDvoLDQwJkpiXlSHEERAPmQiT8JbKm5ojICIFlJDxPxKp7vOPZ5H1qsPvXWryxSfsQKuMyEyoJWsr941DWsspXFv2g4Dijmj0FBWcxhinKk1urK0XEz\
    vh0UJBaVXkRM+kKKVP7a6w5YTr5ol86OnS1h9hhYjVN90kx85XwFmjok5gt9uv2FFxtJ89ZrhfG1LqgddTM5104LEZfdRGvBbTOMHNSnYmzNxQex7nd\
    X67OtnjMiyLZUtvHHeKVtDf3lQ1WMKmvrq/+Hj2gQAADadJREFUeNrt3fd/E0cWAPDRLGjXZFayZMuWDbZccQPTgo0JLZQQIEAoIXRCSAi5hEB6Lg1C\
    OrnkUi69XS49l16u99773fw791YKAWvf1pHR00rzIx8j6+s3O7vz5s0sY9FsqTs+Z0lWja2pWXZfWJV2kCfkvGq01zdLITW5uPrs9VbM5Zd2Xj1uXuj\
    tVjPk8KIqsvNTMa86+zi5Ze9exExeNde5kKebkN3XVIm9vuuMmFeTnfO+cTE/bdcjT+/8AG5pdvulTI+8nZm3oPb5VWDnk79VrXbOOm+uYvvlcDtH7L\
    wK7E3LpdBs9uH5nEffXr9AJortCW14vl4F9oY5VWLniH2vTFeBXTf1YrzOMv/G7Ivnm1GyW27E3niDjBWP8wlj8aUmj8zzfJI1rvgd43Z76qjdLox50\
    bEneapHvn0RFvfcY7LObrf6fCTsJktltYS86jrM3o7aIxL3vNwA+yVo3Nu+GVm7yXJZacBTaxC7YcxbZL8nVKJcyz+vJ+Thq1H7Y7i9wh/nQd6Sj3nh\
    Gf1WsDN/cdc87NxMDg3FJxNoce4pB7t2+9fsz3VgP4rZRy90fLTRk3G9AmIuzpidCu3HqL39Brtds+wmFu9kEobAPVevf/a+519a2TulvG3l7rEB7Lm\
    9fbzcst99fhA79veE4WJg/3MP3rVws23KX4Ym5Hlxe69kO3dBvy324PYcZpfDn9vgSfajn067dfOpHzHK20S67jPsgmR73pFr7Z5vn4+Ndbm9yPO8vK\
    /4GmdtWy+J5f+E0Moeck3EVjlMVJd+YPdo8uuoPQVz2GL5SK7ohya/+Iu6/GeQaFoivcppIGb9/yv25O2zsD7fOGf8ooyQzU1FP/LzIzEr4DTg0nCKe\
    eHLDn4Dsy9zsoszY95cX5TseHkU2FTgMM6kV7lN1Fn/J0ULbPkGdqTPZ5aftgubvOk2eyazrPLYZe5JCjY4htlvQuPe8FWO2h7zK5fblurKLH/c87Fm\
    6hLsO2N9HvK0Bwod2h7zV3qlQUped6OPR7qpuzH7TUif57wpvy4jZFeRPHeAVsy1tT/wk5hjUx/GIrYMtXfCelzCko/rE/F7saumjPLNzzDuyz4YxH6\
    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\
    NwAAAABJRU5ErkJggg==';
  function dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
  }

  cit('shows an indicator for no images', (fix, el, comp) => {
    comp.model = {images: [], changed: () => false};
    comp.minWidth = 123;
    comp.minHeight = 456;
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toContainText('123x456');
  });

  cit('shows an indicator for a deleted image', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: true}], changed: () => true};
    fix.detectChanges();
    expect(el).toContainText('Add Image');
    expect(el).toQuery('.new-image.changed');
  });

  cit('ignores deleted images', (fix, el, comp) => {
    comp.model = {images: [{isDestroy: false}], changed: () => true};
    expect(comp.noImages).toEqual(false);
    expect(comp.model.images.length).toEqual(1);
    comp.model = {images: [{isDestroy: true}]};
    expect(comp.noImages).toEqual(true);
    expect(comp.model.images.length).toEqual(1);
  });

  cit('adds an image', (fix, el, comp, done) => {
    comp.model = {images: [], changed: () => true};
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      fix.detectChanges();
      expect(el).not.toContainText('Add Image');
      expect(el).toQuery('publish-image-file');
      done();
    });
  });

  cit('won\'t add an image that doesn\'t meet min width and height specifications', (fix, el, comp, done) => {
    comp.model = {images: [], changed: () => true};
    comp.minWidth = comp.minHeight = 1400;
    comp.addUpload(dataURItoBlob(imageDataURI));
    comp.reader.addEventListener('loadend', () => {
      fix.detectChanges();
      expect(el).toContainText(`should be at least ${comp.minWidth}x${comp.minHeight} px`);
      expect(comp.model.images.length).toEqual(0);
      done();
    });
  });

});
