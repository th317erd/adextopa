/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      ExpressionStatement,
    },
  },
} = Script;

describe('/Script/V1/ExpressionStatement', () => {
  const test = async (source, debugLevel) => {
    let parser = new Parser({ source });
    let result = await parser.exec(ExpressionStatement(), (debugLevel > 1) ? { debug: true } : undefined);

    if (debugLevel > 0)
      _TestHelpers.inspectLog(result);

    return result;
  };

  it('works', async () => {
    expect(await test('test.derp.stuff[0]')).toMatchSnapshot();
  });
});
