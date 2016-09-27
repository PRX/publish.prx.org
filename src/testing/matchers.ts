import { By } from '@angular/platform-browser';
import { niceEl } from './helpers';

export const matchers: any = {};

const textContent = el => (el && el.nativeElement) ? el.nativeElement.textContent : undefined;
const pass = msg => { return {pass: true, message: msg }; };
const fail = msg => { return {pass: false, message: msg }; };

// check for html element text content
matchers.toHaveText = (util, customEqualityTesters) => {
  return {
    compare: (actual, expected) => {
      if (util.equals(textContent(actual), expected, customEqualityTesters)) {
        return pass(`Expected '${niceEl(actual)}' to not have text '${expected}'`);
      } else {
        return fail(`Expected '${niceEl(actual)}' to have text '${expected}'`);
      }
    }
  };
};

// check for inclusion of text content
matchers.toContainText = (util, customEqualityTesters) => {
  return {
    compare: (actual, expected) => {
      if (util.contains(textContent(actual), expected, customEqualityTesters)) {
        return pass(`Expected '${niceEl(actual)}' to not contain text '${expected}'`);
      } else {
        return fail(`Expected '${niceEl(actual)}' to contain text '${expected}'`);
      }
    }
  };
};

// generic null/not-null querying
matchers.toQuery = (util, customEqualityTesters) => {
  return {
    compare: (actual, cssQuery) => {
      if (actual.query(By.css(cssQuery))) {
        return pass(`Expected not to find '${cssQuery}' in '${niceEl(actual)}'`);
      } else {
        return fail(`Expected to find '${cssQuery}' in '${niceEl(actual)}'`);
      }
    }
  };
};

// query by css, then check the text content
matchers.toQueryText = (util, customEqualityTesters) => {
  return {
    compare: (actual, cssQuery, expected) => {
      if (!actual || !actual.query) {
        return fail(`Expected a DebugElement - given ${actual}`);
      }
      let found = actual.query(By.css(cssQuery));
      if (!found) {
        return fail(`Cannot find css '${cssQuery}' in '${actual}'`);
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
        return fail(`Expected a DebugElement - given ${actual}`);
      }
      let found = actual.query(By.css(cssQuery));
      if (!found) {
        return fail(`Cannot find css '${cssQuery}' in '${actual}'`);
      }

      // TODO: ng-model bindings not being reflected in element values yet
      let value;
      if (attrName === 'value') {
        value = found.nativeElement.getAttribute('ng-reflect-model');
        if (value && found.nativeElement.value === value) {
          console.log('TODO: remove this hacky code, cause ng-model works again');
        }
      } else {
        value = found.nativeElement.getAttribute(attrName);
      }

      if (util.equals(value, expected, customEqualityTesters)) {
        return {pass: true, message: `Expected '${niceEl(found)}' not to have attribute ${attrName}=${expected}`};
      } else {
        return {pass: false, message: `Expected '${niceEl(found)}' to have attribute ${attrName}=${expected}`};
      }
    }
  };
};
