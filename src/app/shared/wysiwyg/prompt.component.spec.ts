import { cit, create } from '../../../testing';
import { PromptComponent } from './prompt.component';

describe('PromptComponent', () => {

  create(PromptComponent);

  cit('shows prompt over overlay when visible', (fix, el, comp) => {
    expect(el).not.toQuery('.overlay');
    expect(el).not.toQuery('.modal');
    comp.show();
    fix.detectChanges();
    expect(el).toQuery('.overlay');
    expect(el).toQuery('.modal');
  });
});
