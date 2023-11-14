/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      FunctionCall,
    },
  },
} = Script;

describe('/Script/V1/Function', () => {
  const test = async (source, debug, deepDebug) => {
    let parser = new Parser({ source });
    let result = await parser.tokenize(FunctionCall(), deepDebug);

    if (debug)
      console.log(_TestHelpers.inspect(result));

    return result;
  };

  it('works', async () => {
    expect(await test('test()')).toMatchSnapshot();
    expect(await test('test(\'hello\')')).toMatchSnapshot();
    expect(await test('test(\'hello\', null, 2.0, true)')).toMatchSnapshot();
    expect(await test('test(\'hello\',, , true)')).toMatchSnapshot();
    //expect(await test('test(\'hello\',true,)')).toMatchSnapshot();
    //expect(await test('test\n(\n\'hello\'\n,\ntrue\n,\n)')).toMatchSnapshot();
  });
});
