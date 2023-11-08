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

  fit('works', async () => {
    const Word = Matches('Word', /\w+/);

    let result = await parser.tokenize(
      Program(
        Pin('Start'),
        Word,
        Pin(Fetch('Start'), Word),
      ),
      true,
    );

    expect(snapshot(result, true)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
  });
});
