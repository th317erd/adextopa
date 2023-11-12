/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Sequence,
} = Matchers;

describe('/Core/Matchers/SequenceMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '"Test \\"Hello world\\" how are you?"' });
  });

  it('works', async () => {
    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\'));

    expect(result).toMatchSnapshot();
  });

  it('works with escaping', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\'));

    expect(result).toMatchSnapshot();
  });

  it('works with RegExp patterns', async () => {
    parser = new Parser({ source: '{{{Test \\}}} \\n \n \\\\ \\t \\r stuff}}}' });

    let result = await parser.tokenize(Sequence('ItWorks', /\{\{\{/, /\}\}\}/, /\\\}\}\}/));

    expect(result).toMatchSnapshot();
  });

  it('will disallow certain characters', async () => {
    parser = new Parser({ source: '"Test \\" \\n \n \\\\ \\t \\r stuff"' });

    let result = await parser.tokenize(Sequence('ItWorks', '"', '"', '\\', [ '\n', '\r' ]));

    expect(result).toMatchSnapshot();
  });
});
