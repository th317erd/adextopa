/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/EqualsMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(Equals('Test'));
    expect(result).toMatchSnapshot();
  });

  it('can be given a custom name', async () => {
    let result = await parser.exec(Equals('Test 1234').name('TestToken'));
    expect(result).toMatchSnapshot();
  });
});
