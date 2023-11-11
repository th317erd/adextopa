/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Loop,
  Switch,
  Equals,
  Error,
} = Matchers;

describe('ErrorMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Loop(
        Switch(
          Equals('Identifier', 'Test'),
          Equals('Operator', '='),
          Equals('Value', '1234'),
          Error('Parsing Error!', ({ token }) => {
            token.matchedRange.end++;
          }),
        ),
      ),
    );

    expect(snapshot(result)).toBe('cda3f47c8ff1c8a40500f226674903b7');
  });
});
