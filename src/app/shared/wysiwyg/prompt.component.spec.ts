import { cit, create } from '../../../testing';
import { PromptComponent } from './prompt.component';

describe('PromptComponent', () => {

  create(PromptComponent);

  cit('shows prompt over overlay when visible', (fix, el, comp) => {
    expect(el).not.toQuery('.overlay');
    expect(el).toQueryAttr('.modal', 'style', 'display: none; opacity: 0;');
    comp.show();
    fix.detectChanges();
    expect(el).toQuery('.overlay');
    expect(el).toQueryAttr('.modal', 'style', 'display: flex; opacity: 1;');
  });
});
