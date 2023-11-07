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
    expect(snapshot(result)).toBe('86d51851d480a0abc646b5b1b9eec724');
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Matches('TestToken', /test\s+\d+/i));
    expect(snapshot(result)).toBe('750f26143339087ab042468da9346464');
  });
});
