import { PublishCliPage } from './app.po';

describe('publish-cli App', function() {
  let page: PublishCliPage;

  beforeEach(() => {
    page = new PublishCliPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
