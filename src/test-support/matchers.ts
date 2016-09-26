import { By } from '@angular/platform-browser';

export const matchers: any = {};

const niceEl = el => {
  el = el.nativeElement || el;
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
};

// check for html element text content
matchers.toHaveText = (util, customEqualityTesters) => {
  return {
    compare: (actual, expected) => {
      let text = (actual && actual.nativeElement) ? actual.nativeElement.textContent : undefined;
      if (util.equals(text, expected, customEqualityTesters)) {
        return {pass: true, message: `Expected '${niceEl(actual)}' to not have text '${expected}'`};
      } else {
        return {pass: false, message: `Expected '${niceEl(actual)}' to have text '${expected}'`};
      }
    }
  };
};

// // check for inclusion of text content
matchers.toContainText = (util, customEqualityTesters) => {
  return {
    compare: (actual, expected) => {
      let text = (actual && actual.nativeElement) ? actual.nativeElement.textContent : undefined;
      if (util.contains(text, expected, customEqualityTesters)) {
        return {pass: true, message: `Expected '${niceEl(actual)}' to not contain text '${expected}'`};
      } else {
        return {pass: false, message: `Expected '${niceEl(actual)}' to contain text '${expected}'`};
      }
    }
  };
};

// query by css, then check the text content
matchers.toQueryText = (util, customEqualityTesters) => {
  return {
    compare: (actual, cssQuery, expected) => {
      if (!actual || !actual.query) {
        return {pass: false, message: `Expected a DebugElement - given ${actual}`};
      }
      let found = actual.query(By.css(cssQuery));
      if (!found) {
        return {pass: false, message: `Cannot find css '${cssQuery}' in '${actual}'`};
      }
      return matchers.toHaveText(util, customEqualityTesters).compare(found, expected);
    }
  };
};

// query by css, then check an attribute of the element
matchers.toQueryAttr = (util, customEqualityTesters) => {
  return {
    compare: (actual, cssQuery, attrName, expected) => {
      if (!actual || !actual.query) {
        return {pass: false, message: `Expected a DebugElement - given ${actual}`};
      }
      let found = actual.query(By.css(cssQuery));
      if (!found) {
        return {pass: false, message: `Cannot find css '${cssQuery}' in '${actual}'`};
      }
      let value = found.nativeElement.getAttribute(attrName);
      if (util.equals(value, expected, customEqualityTesters)) {
        return {pass: true, message: `Expected '${niceEl(found)}' not to have attribute ${attrName}=${expected}`};
      } else {
        return {pass: false, message: `Expected '${niceEl(found)}' to have attribute ${attrName}=${expected}`};
      }
    }
  };
};
