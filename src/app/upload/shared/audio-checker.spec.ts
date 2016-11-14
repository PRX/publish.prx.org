import { FileChecker } from './audio-checker';

describe('AudioChecker', () => {

  const mockSanitizer = <any> {
    bypassSecurityTrustResourceUrl: () => 'sanitized!'
  };

  it('creates a safe object url', () => {
    let f: any = new Blob();
    let checker = new FileChecker(f, mockSanitizer);
    expect(checker.checked).toEqual(false);
    expect(checker.src).toEqual('sanitized!');
  });

  it('sets duration', () => {
    let f: any = new Blob();
    let checker = new FileChecker(f, mockSanitizer);
    checker.check(10);
    expect(checker.checked).toEqual(true);
    expect(checker.file.playable).toEqual(true);
    expect(checker.file.duration).toEqual(10);

    checker.check(null);
    expect(checker.checked).toEqual(true);
    expect(checker.file.playable).toEqual(false);
    expect(checker.file.duration).toEqual(0);
  });

});
