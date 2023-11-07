/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Fetch,
  Matches,
  Program,
  Loop,
  Discard,
  ProxyChildren,
} = Matchers;

describe('ProxyChildrenMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Phone: 602-512-9876' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Discard(Matches(/\s*phone\s*:\s*/i)),
        ProxyChildren(
          Loop('PhonePart',
            Matches(Fetch('PhonePart.children_count'), /\d+/),
            Discard(Matches(/\D+/)),
          ),
        ),
      ),
    );

    expect(snapshot(result)).toBe('1e46aad2fac9a49823437994cba4dc4c');
  });
});
