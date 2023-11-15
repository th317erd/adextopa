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
      Program('TestProgram',
        Equals('Test'),
        Token('CustomToken', { value: 'hello world' }),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with a fetch named', async () => {
    let result = await parser.exec(
      Program('TestProgram',
        Store('TokenName', 'SomeCrazyName'),
        Equals('Test'),
        Token(Fetch('TokenName'), { value: 'hello world', someOtherProp: true }),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
