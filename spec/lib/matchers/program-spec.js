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

/*active*/fdescribe('/Core/Matchers/ProgramMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Matches(/test/i).name('Name'),
        Equals(' ').name('Space'),
        Matches(/\d+/).name('Number'),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
