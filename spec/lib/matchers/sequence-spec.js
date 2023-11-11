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
});
