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
    expect(snapshot(result)).toBe('5a43700520e4e2a32a90b9148b547d9b');
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Equals('TestToken', 'Test 1234'));
    expect(snapshot(result)).toBe('750f26143339087ab042468da9346464');
  });
});
