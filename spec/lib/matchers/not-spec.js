/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Program,
  Not,
} = Matchers;

describe('/Core/Matchers/NotMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Not(Equals('Test')),
      ),
    );

    expect(result).toMatchSnapshot();

    result = await parser.exec(
      Program('TestProgram',
        Equals('Test'),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
