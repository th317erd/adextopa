/* eslint-disable no-magic-numbers */

import FileSystem         from 'node:fs';
import Path               from 'node:path';
import { fileURLToPath }  from 'node:url';

import { snapshot } from '../../../support/test-helpers.js';

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

describe('Script/V1/AdextopaScript', () => {
  const testScript = async (fileName, debug) => {
    let source =  FileSystem.readFileSync(Path.resolve(__dirname, 'scripts', `${fileName.replace(/\.adextopa$/, '')}.adextopa`), 'utf8');
    let parser = new Parser({ source, fileName });
    return snapshot(await parser.tokenize(AdextopaScript(), false), debug);
  };

  it('can parse pragma headers', async () => {
    expect(await testScript('pragma')).toBe('4c6f2759e5d5143fa5c3f03be580a091');
  });

  // it('can parse nested pattern calls', async () => {
  //   expect(await testScript('patterns')).toBe('4c6f2759e5d5143fa5c3f03be580a091');
  // });
});
