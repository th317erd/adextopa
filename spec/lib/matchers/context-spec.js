/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Context,
  Fetch,
  Equals,
} = Matchers;

describe('/Core/Matchers/ContextMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Context(
        Fetch('testMatcher'),
        {
          testMatcher:  Equals(Fetch('matchValue')),
          matchValue:   'Test',
        },
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
