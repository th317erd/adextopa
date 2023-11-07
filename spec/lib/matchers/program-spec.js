/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Matches,
  Program,
} = Matchers;

describe('ProgramMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Matches('Name', /test/i),
        Equals('Space', ' '),
        Matches('Number', /\d+/),
      ),
    );

    expect(snapshot(result)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
  });
});
