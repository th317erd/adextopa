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
  Store,
  Fetch,
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

  it('properly passes along a payload', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Matches('Name', /test/i),
        Store('Whitespace', Discard(Matches('Space', /\s+/i))),
        Matches('Number', /\d+/i),
        Fetch('Whitespace'),
      ),
    );

    expect(snapshot(result)).toBe('c40c4940abd68df4e0b0e5ab03bd0d81');
  });
});
