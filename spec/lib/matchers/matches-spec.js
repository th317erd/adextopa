/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
} = Matchers;

describe('MatchesMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Matches(/test/i));
    expect(snapshot(result)).toBe('b1acbb4cca4956a4f3ad3619f960fdd7');
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Matches('TestToken', /test\s+\d+/i));
    expect(snapshot(result)).toBe('f349f22f0dddd2f0db1c828524465000');
  });
});
