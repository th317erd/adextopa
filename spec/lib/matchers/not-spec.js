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

fdescribe('/Core/Matchers/NotMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Not(Equals('Test')),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot(); // Failure result

    result = await parser.exec(
      Program(
        Not(Equals('Incorrect')),
        Equals('Test'),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot(); // Success result
  });
});
