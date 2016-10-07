import { HalLink } from './hallink';

describe('HalLink', () => {

  it('is a basic interface - so just deal with it, okay?', () => {
    let link = <HalLink> {};
    expect(link.title).toBeUndefined();
  });

});
