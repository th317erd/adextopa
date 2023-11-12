/* global jasmine */

import { matchesSnapshot } from './snapshot.js';

beforeEach(function() {
  jasmine.addMatchers({
    toMatchSnapshot: function() {
      return {
        compare: function(actual) {
          let result  = matchesSnapshot(actual);
          let message = (result) ? `Expected [${actual}] to match snapshot\n${result}` : `Expected [${actual}] to match snapshot`;

          return { pass: !result, message };
        },
      };
    },
  });
});
