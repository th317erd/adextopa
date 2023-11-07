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

describe('ScriptV1IdentifierMatcher', () => {
  const testIdentifier = async (source, debug) => {
    let parser = new Parser({ source });
    let result = await parser.tokenize(Identifier());
    return snapshot(result, debug);
  };

  it('works', async () => {
    expect(await testIdentifier('derp:')).toBe('33aa3758ff82ebf9026676d104ef92c9');
    expect(await testIdentifier('derp!!')).toBe('33aa3758ff82ebf9026676d104ef92c9');
    expect(await testIdentifier('@derp.')).toBe('500a3bcf0063e2768c2268707a95b441');
    expect(await testIdentifier('@derp??')).toBe('500a3bcf0063e2768c2268707a95b441');
    expect(await testIdentifier('@derp!!')).toBe('500a3bcf0063e2768c2268707a95b441');
    expect(await testIdentifier('$derp-')).toBe('659701db5e8c0e3d92df5e4e2979e9b1');
    expect(await testIdentifier('@derp?s')).toBe('6c665341da06f3385bf7f18fc07b989f');
    expect(await testIdentifier('@derp?.')).toBe('6c665341da06f3385bf7f18fc07b989f');
    expect(await testIdentifier('@derp?!')).toBe('6c665341da06f3385bf7f18fc07b989f');
    expect(await testIdentifier('derp!')).toBe('e8541c8308b145bd7842a89bb96b8f6e');
    expect(await testIdentifier('derp_!')).toBe('debad58fdaab600b51b3770a651c7714');
    expect(await testIdentifier('_derp!')).toBe('98de30bb833809506ca77564a732d6ac');
    expect(await testIdentifier('2derp')).toBe('f422a58ba23e3efd2976e9dfdb155799'); // Fail
    expect(await testIdentifier('derp2')).toBe('cd3a8c21cb164cca88019b8a3895612f');
  });
});
