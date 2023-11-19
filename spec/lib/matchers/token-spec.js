import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Program,
  Token,
  Store,
  Fetch,
} = Matchers;

describe('/Core/Matchers/TokenMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234', fileName: 'test.script' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Equals('Test'),
        Token('CustomToken', { value: 'hello world' }),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with a fetch named', async () => {
    let result = await parser.exec(
      Program(
        Store('TokenName', 'SomeCrazyName'),
        Equals('Test'),
        Token(Fetch('TokenName'), { value: 'hello world', someOtherProp: true }),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
