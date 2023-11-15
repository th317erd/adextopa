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

describe('/Core/Matchers/SkipMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  fit('works', async () => {
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

    expect(result).toMatchSnapshot();
  });
});
