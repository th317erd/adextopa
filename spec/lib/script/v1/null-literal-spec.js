/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      NullLiteral,
    },
  },
} = Script;

describe('/Script/V1/NullLiteral', () => {
  it('works', async () => {
    const test = async (source, debug, deepDebug) => {
      let parser = new Parser({ source });
      let result = await parser.exec(NullLiteral(), deepDebug);

      if (debug)
        console.log(_TestHelpers.inspect(result));

      return result;
    };

    expect(await test('null')).toMatchSnapshot();
    expect(await test('nnull')).toMatchSnapshot();
    expect(await test('nulll')).toMatchSnapshot();
  });
});
