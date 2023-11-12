/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      Pragma,
    },
  },
} = Script;

describe('/Script/V1/Pragma', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return snapshot(await parser.tokenize(Pragma(), debug), debug);
    };

    expect(await test('@pragma use(1.0, true)\n')).toBe('85a1734fed2887c8f0e81e2c7374c436');
    expect(await test('@pragma use(1.0, true)')).toBe('85a1734fed2887c8f0e81e2c7374c436');
    expect(await test('@pragma use( 1.0, true,)\n')).toBe('fecc0c0619f4631a5df8dd9906a57f6d');
    expect(await test('@pragma debug( true )\n')).toBe('25603422f18bb63180ddc87f41ca61fa');
    expect(await test('@pragma name(\n\t\'test script\'\n)\n')).toBe('0f40b61d384ff16fb443709c07fcce65');
    expect(await test('@pragma description(\'line1\\\nline2\\\r\nline3\\\rline4\')\n')).toBe('e73aa00599deb1e9e80f2147bdf6fc02');
  });
});
