/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
  Discard,
  Program,
  Store,
  Fetch,
} = Matchers;

describe('/Core/Matchers/DiscardMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Matches('Name', /test/i),
        Discard(Matches('Space', /\s+/i)),
        Matches('Number', /\d+/i),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('properly passes along a payload', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Matches('Name', /test/i),
        Store('Whitespace', Discard(Matches('Space', /\s+/i))),
        Matches('Number', /\d+/i),
        Fetch('Whitespace'),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
