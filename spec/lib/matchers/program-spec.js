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
} = Matchers;

describe('/Core/Matchers/ProgramMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Matches('Name', /test/i),
        Equals('Space', ' '),
        Matches('Number', /\d+/),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
