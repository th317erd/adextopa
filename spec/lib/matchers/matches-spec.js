/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/MatchesMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(Matches(/test/i));
    expect(result).toMatchSnapshot();
  });

  it('can be given a custom name', async () => {
    let result = await parser.exec(Matches(/test\s+\d+/i).name('TestToken'));
    expect(result).toMatchSnapshot();
  });
});
