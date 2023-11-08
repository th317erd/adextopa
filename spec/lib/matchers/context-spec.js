/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Context,
  Fetch,
  Equals,
  Matches,
  Program,
} = Matchers;

describe('ContextMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Context(
        Fetch('testMatcher'),
        {
          testMatcher:  Equals(Fetch('matchValue')),
          matchValue:   'Test',
        },
      ),
    );

    expect(snapshot(result)).toBe('5a43700520e4e2a32a90b9148b547d9b');
  });

  it('can reference other matchers', async () => {
    parser = new Parser({ source: 'Hello World' });

    // Pin('Name', Matches('Word', /\w+/));

    let result = await parser.tokenize(
      Program(
        Matches('Word', /\w+/),
        Matches(/\s+/),
        Fetch('Word'),
      ),
    );

    expect(snapshot(result)).toBe('37174451a80f5d5a2ce6cc7d41d46505');
  });
});
