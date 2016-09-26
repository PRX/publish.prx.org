import { By } from '@angular/platform-browser';

// find a component within a debug element
export function findComponent(el, tagName) {
  let subEl = el.query(By.css(tagName));
  expect(subEl).not.toBeNull(`Unable to find component ${tagName}`);
  return subEl.componentInstance;
}
