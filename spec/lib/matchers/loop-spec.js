/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Matches,
  Discard,
  Switch,
  Loop,
  Iterate,
  Optional,
} = Matchers;

describe('LoopMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    const NameOrNumber = Switch(
      Matches('Name', /test/i),
      Equals('Space', ' '),
      Matches('Number', /\d+/),
    );

    let result = await parser.tokenize(
      Loop('TestProgram', NameOrNumber),
    );

    expect(snapshot(result)).toBe('1aed42ed7236d48605e88fa02a0ef6d2');
  });

  it('can iterate', async () => {
    parser = new Parser({ source: '1 5 10 15 20 25' });

    let result = await parser.tokenize(
      Iterate('Repeated', 0, 4,
        Matches('Number', /\d+/),
        Discard(Optional(Matches('Space', /\s+/))),
      ),
    );

    expect(snapshot(result)).toBe('82aceee0650ad3e0ad338133c3cdaa2a');
  });
});
