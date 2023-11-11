/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Matches,
  Pin,
} = Matchers;

describe('PinMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test World' });
  });

  it('works', async () => {
    const Word = Matches('Word', /\w+/);

    // Here we get a success, even though
    // we only end up matching the range 'Test '.
    // This is because the pin never moves
    // the cursor, and so even though the
    // match is successful, the match is
    // discarded, as though it didn't
    // happen.

    let result = await parser.tokenize(
      Program(
        Word,
        Equals(' '),
        Pin(Word),
      ),
    );

    expect(snapshot(result)).toBe('077aaed958566de40a6189502ee7383e');
  });

  // it('works with seek', async () => {
  // });
});
