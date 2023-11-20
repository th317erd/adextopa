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

/*active*/fdescribe('/Core/Matchers/TokenMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234', fileName: 'test.script' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Equals('Test'),
        Token({ value: 'hello world' }).name('CustomToken'),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with a fetched name', async () => {
    let result = await parser.exec(
      Program(
        Store('TokenName', 'SomeCrazyName'),
        Equals('Test'),
        Token({ value: 'hello world', someOtherProp: true }).name(Fetch('TokenName')),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
