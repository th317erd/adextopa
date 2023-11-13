/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      Identifier,
    },
  },
} = Script;

describe('/Script/V1/Identifier', () => {
  const test = async (source, debug) => {
    let parser = new Parser({ source });
    return await parser.tokenize(Identifier(), debug);
  };

  it('works', async () => {
    expect(await test('derp:')).toMatchSnapshot();
    expect(await test('derp!!')).toMatchSnapshot();
    expect(await test('@derp.')).toMatchSnapshot();
    expect(await test('@derp??')).toMatchSnapshot();
    expect(await test('@derp!!')).toMatchSnapshot();
    expect(await test('$derp-')).toMatchSnapshot();
    expect(await test('@derp?s')).toMatchSnapshot();
    expect(await test('@derp?.')).toMatchSnapshot();
    expect(await test('@derp?!')).toMatchSnapshot();
    expect(await test('derp!')).toMatchSnapshot();
    expect(await test('derp_!')).toMatchSnapshot();
    expect(await test('_derp!')).toMatchSnapshot();
    expect(await test('2derp')).toMatchSnapshot(); // Fail
    expect(await test('derp2')).toMatchSnapshot();
  });
});
