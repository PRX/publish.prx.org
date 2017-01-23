import { cit, create, By } from '../../../testing';
import { AdvancedSectionComponent } from './advanced-section.component';


describe('AdvancedSectionComponent', () => {

  create(AdvancedSectionComponent);

  cit('toggles showing advanced settings', (fix, el, comp) => {
    expect(el).toContainText('Show');
    el.query(By.css('button')).nativeElement.click();
    fix.detectChanges();
    expect(el).toContainText('Hide');
  });

});
