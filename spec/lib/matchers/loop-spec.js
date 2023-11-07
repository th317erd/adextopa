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

    expect(snapshot(result)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
  });

  it('can iterate', async () => {
    parser = new Parser({ source: '1 5 10 15 20 25' });

    let result = await parser.tokenize(
      Iterate('Repeated', 0, 4,
        Matches('Number', /\d+/),
        Discard(Optional(Matches('Space', /\s+/))),
      ),
    );

    expect(snapshot(result)).toBe('9c186424441173f916bef346f290cda4');
  });
});
