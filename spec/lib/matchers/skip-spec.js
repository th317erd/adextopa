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

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Matches(/test/i).name('Name'),
        Skip(Matches(/\s+/i).name('Space')),
        Matches(/\d+/i).name('Number'),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('properly passes along a payload', async () => {
    let result = await parser.exec(
      Program(
        Matches(/test/i).name('Name'),
        Store('Whitespace', Skip(Matches(/\s+/i).name('Space'))),
        Matches(/\d+/i).name('Number'),
        Fetch('Whitespace'),
      ).name('TestProgram'),
    );

    // console.log(_TestHelpers.inspect(result));

    expect(result).toMatchSnapshot();
  });
});
