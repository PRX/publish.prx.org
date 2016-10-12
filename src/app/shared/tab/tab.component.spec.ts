import { cit, contain, By } from '../../../testing';
import { TabService } from './tab.service';
import { TabComponent } from './tab.component';

describe('TabComponent', () => {

  contain(TabComponent, {
    template: `
      <publish-tabs [model]="testModel">
        <nav>
          <a [routerLink]="['foo']">Foo</a>
          <a [routerLink]="['bar']">Bar</a>
        </nav>
        <h1>Extra stuff here</h1>
      </publish-tabs>
    `
  });

  // publish-tabs provides its own TabService... so just stub it here
  let currentModel: any;
  beforeEach(() => {
    currentModel = null;
    spyOn(TabService.prototype, 'setModel').and.callFake(m => currentModel = m);
  });

  cit('shows the tabbed content', (fix, el, comp) => {
    let navs = el.queryAll(By.css('nav a'));
    expect(navs.length).toEqual(2);
    expect(navs[0]).toHaveText('Foo');
    expect(navs[1]).toHaveText('Bar');
    expect(el).toQueryText('h1', 'Extra stuff here');
  });

  cit('shows a spinner until the model is bound', (fix, el, comp) => {
    expect(el).toQuery('publish-spinner');
    comp.testModel = {};
    fix.detectChanges();
    expect(el).not.toQuery('publish-spinner');
  });

  cit('tells the tab service about the model', (fix, el, comp) => {
    expect(currentModel).toBeNull();
    comp.testModel = 'thing1';
    fix.detectChanges();
    expect(currentModel).toEqual('thing1');
    comp.testModel = 'thing2';
    fix.detectChanges();
    expect(currentModel).toEqual('thing2');
  });

});
