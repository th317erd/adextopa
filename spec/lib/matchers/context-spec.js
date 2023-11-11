/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Context,
  Fetch,
  Equals,
} = Matchers;

describe('ContextMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Context(
        Fetch('testMatcher'),
        {
          testMatcher:  Equals(Fetch('matchValue')),
          matchValue:   'Test',
        },
      ),
    );

    expect(snapshot(result)).toBe('c46b6e1121dd058680231f1ef51dd7aa');
  });
});
