/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
} = Matchers;

describe('/Core/Matchers/MatchesMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Matches(/test/i));
    expect(result).toMatchSnapshot();
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Matches('TestToken', /test\s+\d+/i));
    expect(result).toMatchSnapshot();
  });
});
