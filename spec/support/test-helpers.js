/* global jasmine */

import * as Util            from 'node:util';
import { matchesSnapshot }  from './snapshot.js';

beforeEach(function() {
  jasmine.addMatchers({
    toMatchSnapshot: function() {
      return {
        compare: function(actual, skipMessage) {
          let result  = matchesSnapshot(actual);
          let message = (result && skipMessage !== true) ? `Expected [${actual}] to match snapshot\n${result}` : `Expected [${actual}] to match snapshot`;

          return { pass: !result, message };
        },
      };
    },
  });
});

const INSPECT_OPTIONS = {
  depth:            Infinity,
  colors:           true,
  maxArrayLength:   Infinity,
  maxStringLength:  Infinity,
  breakLength:      Infinity,
  compact:          false,
  sorted:           false,
  getters:          false,
  numericSeparator: true,
};

export function inspect(...args) {
  return args.map((arg) => Util.inspect(arg, INSPECT_OPTIONS)).join('');
}

export function inspectNoColor(...args) {
  return args.map((arg) => Util.inspect(arg, { ...INSPECT_OPTIONS, colors: false })).join('');
}
