/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      BooleanLiteral,
    },
  },
} = Script;

describe('/Script/V1/BooleanLiteral', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return await parser.tokenize(BooleanLiteral(), debug);
    };

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
  });
});
