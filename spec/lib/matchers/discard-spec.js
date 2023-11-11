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

    expect(snapshot(result)).toBe('547e9b139955028b8dd25128d8a6635b');
  });
});
