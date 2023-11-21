/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      NumberLiteral,
    },
  },
} = Script;

describe('/Script/V1/NumberLiteral', () => {
  it('works', async () => {
    const test = async (source, debugLevel) => {
      let parser  = new Parser({ source });
      let result  = await parser.exec(NumberLiteral(), (debugLevel > 1) ? { debug: true } : undefined);

      if (debugLevel > 0)
        console.log(_TestHelpers.inspect(result));

      return result;
    };

    expect(await test('0.0')).toMatchSnapshot();
    expect(await test('10.02')).toMatchSnapshot();
    expect(await test('-0.0')).toMatchSnapshot();
    expect(await test('-0.0+')).toMatchSnapshot();
    expect(await test('-00.0001')).toMatchSnapshot();
    expect(await test('+0.0')).toMatchSnapshot();
    expect(await test('+0.0-')).toMatchSnapshot();
    expect(await test('+42')).toMatchSnapshot();
    expect(await test('-42')).toMatchSnapshot();
    expect(await test('-0')).toMatchSnapshot();
    expect(await test('0')).toMatchSnapshot();
    expect(await test('105')).toMatchSnapshot();
    expect(await test('8.102916686331973e-11')).toMatchSnapshot();
    expect(await test('8.102916686331973e-1')).toMatchSnapshot();
    expect(await test('8.0e-001')).toMatchSnapshot();
    expect(await test('0.+0')).toMatchSnapshot();
    expect(await test('0.-0')).toMatchSnapshot();
    expect(await test('.0')).toMatchSnapshot();
    expect(await test('0.')).toMatchSnapshot();
    expect(await test('0.0e')).toMatchSnapshot();
    expect(await test('0.0e-')).toMatchSnapshot();
  });
});
