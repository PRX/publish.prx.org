import { PublishprxorgPage } from './app.po';

describe('publishprxorg App', function() {
  let page: PublishprxorgPage;

  beforeEach(() => {
    page = new PublishprxorgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
