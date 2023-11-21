/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      MemberExpression,
    },
  },
} = Script;

describe('/Script/V1/MemberExpression', () => {
  const test = async (source, debug, deepDebug) => {
    let parser = new Parser({ source });
    let result = await parser.exec(MemberExpression(), { debug: deepDebug });

    if (debug)
      _TestHelpers.inspectLog(result);

    return result;
  };

  it('works', async () => {
    // await test('name.derp', true);
  });
});
