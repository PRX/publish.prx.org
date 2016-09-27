import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

// find a component within a debug element
export function findComponent(el: DebugElement, tagName: string): any {
  let subEl = el.query(By.css(tagName));
  expect(subEl).not.toBeNull(`Unable to find component ${tagName}`);
  return subEl.componentInstance;
}

// nicely stringify a debug/native element
export function niceEl(el: DebugElement|any): string {
  if (el instanceof DebugElement) {
    el = el.nativeElement;
  }
  if (el.tagName) {
    let str = `<${el.tagName.toLowerCase()}`;
    for (let a of el.attributes) {
      if (a.name[0] !== '_') { str += ` ${a.name}=${a.value}`; }
    }
    str += '>';
    for (let n of el.childNodes) {
      if (n.nodeType === 1) {
        str += niceEl(n);
      } else if (n.nodeType !== 8) {
        str += n.textContent.replace(/\r?\n|\r/g, '').trim();
      }
    }
    str += `</${el.tagName.toLowerCase()}>`;
    return str;
  } else {
    return `${el}`;
  }
}
