/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      Literal,
    },
  },
} = Script;

describe('/Script/V1/Literal', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return await parser.exec(Literal(), debug);
    };

    // Boolean
    expect(await test('true')).toMatchSnapshot();
    expect(await test('true.')).toMatchSnapshot();
    expect(await test('true+')).toMatchSnapshot();
    expect(await test('true/')).toMatchSnapshot();
    expect(await test('true ')).toMatchSnapshot();
    expect(await test('false')).toMatchSnapshot();
    expect(await test('false.')).toMatchSnapshot();
    expect(await test('false+')).toMatchSnapshot();
    expect(await test('false/')).toMatchSnapshot();
    expect(await test('false ')).toMatchSnapshot();
    expect(await test('True')).toMatchSnapshot();
    expect(await test('TRUE')).toMatchSnapshot();
    expect(await test('False')).toMatchSnapshot();
    expect(await test('FALSE')).toMatchSnapshot();
    expect(await test('truey')).toMatchSnapshot();
    expect(await test('true_')).toMatchSnapshot();
    expect(await test('falsey')).toMatchSnapshot();
    expect(await test('false_')).toMatchSnapshot();

    // Number
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

    // String
    expect(await test('\'derp\'')).toMatchSnapshot();
    expect(await test('\'derp \\\'escaped\\\' here\'')).toMatchSnapshot();
    expect(await test('\'derp \\\'escaped\\\' here\'   stuff')).toMatchSnapshot();
    expect(await test('\'Line 1 \\\nLine 2\\\r\nLine 3\\\rEnd\'')).toMatchSnapshot();

    // Failures
    expect(await test('derp')).toMatchSnapshot();
    expect(await test('')).toMatchSnapshot();
    expect(await test('"0"')).toMatchSnapshot();
    expect(await test('#')).toMatchSnapshot();

    // Null
    expect(await test('null')).toMatchSnapshot();
    expect(await test('nulll')).toMatchSnapshot();
  });
});
