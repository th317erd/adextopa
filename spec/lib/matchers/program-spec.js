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

    expect(snapshot(result)).toBe('1aed42ed7236d48605e88fa02a0ef6d2');
  });
});
