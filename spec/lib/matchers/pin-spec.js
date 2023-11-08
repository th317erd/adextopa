/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Program,
  Fetch,
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

    let result = await parser.tokenize(
      Program(
        Pin('Start'),
        Word,
        Pin(Fetch('Start'), Word),
      ),
    );

    expect(snapshot(result)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
  });
});
