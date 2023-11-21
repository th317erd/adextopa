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
    let result = await parser.exec(
      Program(
        Skip(Matches(/\s*phone\s*:\s*/i)),
        ProxyChildren(
          Loop(
            Matches(/\d+/).name(Fetch('PhonePart.token.childrenCount')),
            Skip(Matches(/\D+/)),
          ).name('PhonePart'),
        ),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
