/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
} = Matchers;

describe('EqualsMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Equals('Test'));
    expect(snapshot(result)).toBe('c46b6e1121dd058680231f1ef51dd7aa');
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Equals('TestToken', 'Test 1234'));
    expect(snapshot(result)).toBe('f349f22f0dddd2f0db1c828524465000');
  });
});
