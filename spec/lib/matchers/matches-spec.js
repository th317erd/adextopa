/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Matches,
} = Matchers;

describe('/Core/Matchers/MatchesMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(Matches(/test/i));
    expect(result).toMatchSnapshot();
  });

  it('can be given a custom name', async () => {
    let result = await parser.exec(Matches(/test\s+\d+/i).name('TestToken'));
    expect(result).toMatchSnapshot();
  });

  it('can properly use capture groups', async () => {
    let result = await parser.exec(Matches(/test\s+(\d+)/i).name('TestToken'));
    expect(result).toMatchSnapshot();
  });

  it('can properly use named capture groups', async () => {
    let result = await parser.exec(Matches(/(?<word>\w+)\s+(?<value>\d+)/i).name('TestToken'));
    expect(result).toMatchSnapshot();
  });

  it('can suppress array indices in captures', async () => {
    let result = await parser.exec(Matches(/(?<word>\w+)\s+(?<value>\d+)/i).name('TestToken').suppressIndices(true));
    expect(result).toMatchSnapshot();
  });
});
