/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
  Skip,
  Program,
  Store,
  Fetch,
} = Matchers;

fdescribe('/Core/Matchers/SkipMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Matches('Name', /test/i),
        Skip(Matches('Space', /\s+/i)),
        Matches('Number', /\d+/i),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('properly passes along a payload', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Matches('Name', /test/i),
        Store('Whitespace', Skip(Matches('Space', /\s+/i))),
        Matches('Number', /\d+/i),
        Fetch('Whitespace'),
      ),
    );

    // console.log(_TestHelpers.inspect(result));

    expect(result).toMatchSnapshot();
  });
});
