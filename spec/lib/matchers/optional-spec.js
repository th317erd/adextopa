/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
  Optional,
  Program,
} = Matchers;

describe('OptionalMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Optional(Matches('Name', /test/i)),
        Optional(Matches('Nothing', /derp/i)),
        Optional(Matches('Space', /\s+/i)),
        Optional(Matches('Nothing', /derp/i)),
        Optional(Matches('Number', /\d+/i)),
      ),
    );

    expect(snapshot(result)).toBe('1aed42ed7236d48605e88fa02a0ef6d2');
  });
});
