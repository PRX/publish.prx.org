import { cit, contain } from '../../../testing';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {

  contain(HeroComponent, {
    template: `
      <publish-hero>
        <h1 class="hero-title">The Title</h1>
        <h2 class="hero-info" *ngIf="showInfo">The Infos</h2>
        <h3 class="hero-actions">The Actions</h3>
      </publish-hero>
      <div [style.height.px]="1000"></div>
    `
  });

  let fakeScrollY = 0;
  beforeEach(() => {
    spyOn(HeroComponent.prototype, 'getScrollY').and.callFake(() => fakeScrollY);
  });

  const triggerScroll = () => {
    let e = document.createEvent('UIEvents');
    e.initUIEvent('scroll', true, true, window, 1);
    window.dispatchEvent(e);
  };

  cit('shows the title content', (fix, el, comp) => {
    expect(el).toQueryText('h1', 'The Title');
  });

  cit('shows a spinner when info is missing', (fix, el, comp) => {
    expect(el).not.toQuery('h2');
    expect(el).toQuery('publish-spinner');
    comp.showInfo = true;
    fix.detectChanges();
    expect(el).toQueryText('h2', 'The Infos');
    expect(el).not.toQuery('publish-spinner');
  });

  cit('shows the actions', (fix, el, comp) => {
    expect(el).toQueryText('h3', 'The Actions');
  });

  cit('affixes when scrolled', (fix, el, comp) => {
    expect(el).not.toQuery('.affix');
    fakeScrollY = 999;
    triggerScroll();
    fix.detectChanges();
    expect(el).toQuery('.affix');
  });

});
