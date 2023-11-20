/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      StringLiteral,
    },
  },
} = Script;

/*active*/fdescribe('/Script/V1/StringLiteral', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '\'test string \\\'escaped\\\' test\'' });
  });

  it('works', async () => {
    let result = await parser.exec(StringLiteral());
    expect(result).toMatchSnapshot();
  });

  it('can have a custom name', async () => {
    let result = await parser.exec(StringLiteral('MyString'));
    expect(result).toMatchSnapshot();
  });

  it('can be a multiline string', async () => {
    parser = new Parser({ source: '\'Line 1 \\\nLine 2\\\r\nLine 3\\\rEnd\'' });

    let result = await parser.exec(StringLiteral());
    expect(result).toMatchSnapshot();
  });
});
