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
  const testIdentifier = async (source, debug) => {
    let parser = new Parser({ source });
    return await parser.tokenize(Identifier(), debug);
  };

  it('works', async () => {
    expect(await testIdentifier('derp:')).toMatchSnapshot();
    expect(await testIdentifier('derp!!')).toMatchSnapshot();
    expect(await testIdentifier('@derp.')).toMatchSnapshot();
    expect(await testIdentifier('@derp??')).toMatchSnapshot();
    expect(await testIdentifier('@derp!!')).toMatchSnapshot();
    expect(await testIdentifier('$derp-')).toMatchSnapshot();
    expect(await testIdentifier('@derp?s')).toMatchSnapshot();
    expect(await testIdentifier('@derp?.')).toMatchSnapshot();
    expect(await testIdentifier('@derp?!')).toMatchSnapshot();
    expect(await testIdentifier('derp!')).toMatchSnapshot();
    expect(await testIdentifier('derp_!')).toMatchSnapshot();
    expect(await testIdentifier('_derp!')).toMatchSnapshot();
    expect(await testIdentifier('2derp')).toMatchSnapshot(); // Fail
    expect(await testIdentifier('derp2')).toMatchSnapshot();
  });
});
