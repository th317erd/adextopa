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
  Message,
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
          Equals('Test').name('Identifier'),
          Equals('=').name('Operator'),
          Equals('1234').name('Value'),
          Message('Parsing Error!', ({ token }) => {
            token.matchedRange.end++;
          }),
        ),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
