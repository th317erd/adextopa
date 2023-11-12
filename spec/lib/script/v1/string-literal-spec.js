/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

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

describe('/Script/V1/StringLiteral', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '\'test string \\\'escaped\\\' test\'' });
  });

  it('works', async () => {
    let result = await parser.tokenize(StringLiteral());
    expect(snapshot(result)).toBe('9eca5f70c8a7b15e0711be23fb234782');
  });

  it('can have a custom name', async () => {
    let result = await parser.tokenize(StringLiteral('MyString'));
    expect(snapshot(result)).toBe('3729fca0ff15659986caffe59c2fd46d');
  });

  it('can be a multiline string', async () => {
    parser = new Parser({ source: '\'Line 1 \\\nLine 2\\\r\nLine 3\\\rEnd\'' });

    let result = await parser.tokenize(StringLiteral());
    expect(snapshot(result)).toBe('14a25c0ca3a8268d787932f5ef456998');
  });
});
