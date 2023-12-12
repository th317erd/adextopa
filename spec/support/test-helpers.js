/* global jasmine */

import * as Util            from 'node:util';
import { matchesSnapshot }  from './snapshot.js';
import { isPlainObject }    from '../../lib/utils.js';

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

const INSPECT_OPTIONS = Object.assign(Object.create(null), {
  depth:            Infinity,
  colors:           true,
  maxArrayLength:   Infinity,
  maxStringLength:  Infinity,
  breakLength:      Infinity,
  compact:          false,
  sorted:           false,
  getters:          false,
  numericSeparator: false,
});

export function inspect(...args) {
  let options = INSPECT_OPTIONS;
  if (this !== globalThis && isPlainObject(this))
    options = Object.assign({}, INSPECT_OPTIONS, this);

  return args.map((arg) => Util.inspect(arg, options)).join('');
}

export function inspectLog(...args) {
  console.log(inspect.call(this, ...args));
}
