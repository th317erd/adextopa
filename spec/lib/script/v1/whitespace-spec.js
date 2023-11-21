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

describe('/Script/V1/Whitespace', () => {
  const test = async (source, debugLevel) => {
    let parser = new Parser({ source });
    let result = await parser.exec(NullLiteral(), (debugLevel > 1) ? { debug: true } : undefined);

    if (debugLevel > 0)
      console.log(_TestHelpers.inspect(result));

    return result;
  };

  it('works', async () => {
  });
});
