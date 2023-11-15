/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Loop,
  Switch,
  Equals,
  Error,
} = Matchers;

describe('/Core/Matchers/MessageMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Loop(
        Switch(
          Equals('Identifier', 'Test'),
          Equals('Operator', '='),
          Equals('Value', '1234'),
          Error('Parsing Error!', ({ token }) => {
            token.matchedRange.end++;
          }),
        ),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
