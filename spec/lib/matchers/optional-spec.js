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

fdescribe('/Core/Matchers/OptionalMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Optional(Matches('Name', /test/i)),
        Optional(Matches('Nothing', /derp/i)),
        Optional(Matches('Space', /\s+/i)),
        Optional(Matches('Nothing', /derp/i)),
        Optional(Matches('Number', /\d+/i)),
      ),
      // { debug: true },
    );

    // console.log(_TestHelpers.inspect(result));

    expect(result).toMatchSnapshot();
  });
});
