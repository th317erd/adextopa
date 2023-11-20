/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Sequence,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/SequenceMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '"Test \\"Hello world\\" how are you?"' });
  });

  it('works', async () => {
    let result = await parser.exec(Sequence('"', '"', '\\').name('ItWorks'));

    expect(result).toMatchSnapshot();
  });

  it('works with escaping', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.exec(Sequence('"', '"', '\\').name('ItWorks'));

    expect(result).toMatchSnapshot();
  });

  it('works with RegExp patterns', async () => {
    parser = new Parser({ source: '{{{Test \\}}} \\n \n \\\\ \\t \\r stuff}}}' });

    let result = await parser.exec(Sequence(/\{\{\{/, /\}\}\}/, /\\\}\}\}/).name('ItWorks'));

    expect(result).toMatchSnapshot();
  });

  it('will disallow certain characters', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.exec(Sequence('"', '"', '\\', [ '\n', '\r' ]).name('ItWorks'));

    expect(result.success).toBe(false);
    expect(result.result).toBeInstanceOf(Error);
    expect(result.result.message).toBe('Failed to match');
  });
});
