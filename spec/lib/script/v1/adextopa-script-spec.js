/* eslint-disable no-magic-numbers */

import FileSystem         from 'node:fs';
import Path               from 'node:path';
import { fileURLToPath }  from 'node:url';

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = Path.dirname(__filename);

const {
  V1: {
    Matchers: {
      AdextopaScript,
    },
  },
} = Script;

describe('/Script/V1/AdextopaScript', () => {
  const test = async (fileName, debug, deepDebug) => {
    let source  = FileSystem.readFileSync(Path.resolve(__dirname, 'scripts', `${fileName.replace(/\.adextopa$/, '')}.adextopa`), 'utf8');
    let parser  = new Parser({ source, fileName });
    let result  = await parser.tokenize(AdextopaScript(), deepDebug);

    if (debug)
      _TestHelpers.inspect(result);

    return result;
  };

  it('can parse pragma headers', async () => {
    expect(await test('pragma')).toMatchSnapshot();
  });

  // it('can parse nested pattern calls', async () => {
  //   expect(await testScript('patterns')).toMatchSnapshot();
  // });
});
