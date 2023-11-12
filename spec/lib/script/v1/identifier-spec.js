/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

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
    let result = await parser.tokenize(Identifier());
    return snapshot(result, debug);
  };

  it('works', async () => {
    expect(await testIdentifier('derp:')).toBe('50843d4aaf92651434dfdb4e55fbb13d');
    expect(await testIdentifier('derp!!')).toBe('50843d4aaf92651434dfdb4e55fbb13d');
    expect(await testIdentifier('@derp.')).toBe('eaeb74f545f8b0f3a6de7fda25790ed0');
    expect(await testIdentifier('@derp??')).toBe('eaeb74f545f8b0f3a6de7fda25790ed0');
    expect(await testIdentifier('@derp!!')).toBe('eaeb74f545f8b0f3a6de7fda25790ed0');
    expect(await testIdentifier('$derp-')).toBe('37ef5227b8e5985bff958230eae9ee4e');
    expect(await testIdentifier('@derp?s')).toBe('90528d8ede27fe04fb3a1db430a60a41');
    expect(await testIdentifier('@derp?.')).toBe('90528d8ede27fe04fb3a1db430a60a41');
    expect(await testIdentifier('@derp?!')).toBe('90528d8ede27fe04fb3a1db430a60a41');
    expect(await testIdentifier('derp!')).toBe('6181168f18c7b004974217583ca48c62');
    expect(await testIdentifier('derp_!')).toBe('029e958dcb46a6ea2dec446a3e53dcf4');
    expect(await testIdentifier('_derp!')).toBe('588e050b865b6ea2e0ced040a59042a0');
    expect(await testIdentifier('2derp')).toBe('ec849c2b4452f1c7538f193a18f1d244'); // Fail
    expect(await testIdentifier('derp2')).toBe('5c739d72326e23d1c7512ef6f17007d3');
  });
});
