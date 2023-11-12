/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Fetch,
  Matches,
  Program,
  Loop,
  Skip,
  ProxyChildren,
} = Matchers;

describe('/Core/Matchers/ProxyChildrenMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Phone: 602-512-9876' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Skip(Matches(/\s*phone\s*:\s*/i)),
        ProxyChildren(
          Loop('PhonePart',
            Matches(Fetch('PhonePart.children_count'), /\d+/),
            Skip(Matches(/\D+/)),
          ),
        ),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
