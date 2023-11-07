/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
  Discard,
  Program,
} = Matchers;

describe('DiscardMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Matches('Name', /test/i),
        Discard(Matches('Space', /\s+/i)),
        Matches('Number', /\d+/i),
      ),
    );

    expect(snapshot(result)).toBe('797dea4eacf7b178c6ba00e40fa9b46f');
  });
});
