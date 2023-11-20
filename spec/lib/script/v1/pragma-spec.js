/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

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

/*active*/fdescribe('/Script/V1/Pragma', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return await parser.exec(Pragma(), debug);
    };

    expect(await test('@pragma use(1.0, true)\n')).toMatchSnapshot();
    expect(await test('@pragma use(1.0, true)')).toMatchSnapshot();
    expect(await test('@pragma use( 1.0, true,)\n')).toMatchSnapshot();
    expect(await test('@pragma debug( true )\n')).toMatchSnapshot();
    expect(await test('@pragma name(\n\t\'test script\'\n)\n')).toMatchSnapshot();
    expect(await test('@pragma description(\'line1\\\nline2\\\r\nline3\\\rline4\')\n')).toMatchSnapshot();
  });
});
