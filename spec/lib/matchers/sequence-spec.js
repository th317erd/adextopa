/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Sequence,
} = Matchers;

describe('SequenceMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '"Test \\"Hello world\\" how are you?"' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\'));

    expect(snapshot(result)).toBe('44019c5ef7994a32522cb5fb6ccb6fa2');
  });

  it('works with escaping', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\'));

    expect(snapshot(result)).toBe('0b7d7eaff9208ccd385752e0d142f926');
  });

  it('works with RegExp patterns', async () => {
    parser = new Parser({ source: '{{{Test \\}}} \\n \n \\\\ \\t \\r stuff}}}' });

    let result = await parser.tokenize(Sequence('ItWorks', /\{\{\{/, /\}\}\}/, /\\\}\}\}/));

    expect(snapshot(result)).toBe('64294379c0e866604646e7f6c914d837');
  });

  it('will disallow certain characters', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\', [ '\n', '\r' ]));

    expect(snapshot(result)).toBe('ec849c2b4452f1c7538f193a18f1d244');
  });
});
