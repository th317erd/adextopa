/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
  Optional,
  Program,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/OptionalMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Optional(Matches(/test/i).name('Name')),
        Optional(Matches(/derp/i).name('Nothing')),
        Optional(Matches(/\s+/i).name('Space')),
        Optional(Matches(/derp/i).name('Nothing')),
        Optional(Matches(/\d+/i).name('Number')),
      ).name('TestProgram'),
      // { debug: true },
    );

    // console.log(_TestHelpers.inspect(result));

    expect(result).toMatchSnapshot();
  });
});
