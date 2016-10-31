import { PublishPrxOrgPage } from './app.po';

describe('publish.prx.org App', function() {
  let page: PublishPrxOrgPage;

  beforeEach(() => {
    page = new PublishPrxOrgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
