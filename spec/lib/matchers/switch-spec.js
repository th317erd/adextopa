/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Matches,
  Program,
  Switch,
} = Matchers;

describe('/Core/Matchers/SwitchMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    const NameOrNumber = Switch(
      Matches('Name', /test/i),
      Equals('Space', ' '),
      Matches('Number', /\d+/),
    );

    let result = await parser.tokenize(
      Program('TestProgram',
        NameOrNumber,
        NameOrNumber,
        NameOrNumber,
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
