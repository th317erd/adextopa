/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
} = Matchers;

describe('/Core/Matchers/EqualsMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Equals('Test'));
    expect(result).toMatchSnapshot();
  });

  it('can be given a custom name', async () => {
    let result = await parser.tokenize(Equals('TestToken', 'Test 1234'));
    expect(result).toMatchSnapshot();
  });
});
