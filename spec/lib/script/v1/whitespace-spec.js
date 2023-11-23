/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      Whitespace,
    },
  },
} = Script;

describe('/Script/V1/Whitespace', () => {
  const test = async (source, matcher, debugLevel) => {
    let parser = new Parser({ source });
    let result = await parser.exec(matcher, (debugLevel > 1) ? { debug: true } : undefined);

    if (debugLevel > 0)
      console.log(_TestHelpers.inspect(result));

    return result;
  };

  it('works', async () => {
    expect(await test('  \n  ', Whitespace())).toMatchSnapshot();
  });

  it('works with newlines', async () => {
    expect(await test('  \n  ', Whitespace().newlines(true))).toMatchSnapshot();
  });

  it('works with line comments', async () => {
    expect(await test('  \n // test\n \n// derp', Whitespace().newlines(true).lineComments(true))).toMatchSnapshot();
  });

  it('works with block comments', async () => {
    expect(await test('  \n // test\n \n/* derp \n stuff */', Whitespace().newlines(true).lineComments(true).blockComments(true))).toMatchSnapshot();
  });

  it('will discard whitespace if asked to', async () => {
    expect(await test('  \n // test\n \n/* derp \n stuff */', Whitespace().newlines(true).lineComments(true).blockComments(true).discardWhitespace(true))).toMatchSnapshot();
  });
});
