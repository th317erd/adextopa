/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  MapResult,
  Equals,
} = Matchers;

describe('/Core/Matchers/MapMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.exec(
      MapResult(Equals('Test'), function({ context }, result) {
        let token   = result.token;
        let source  = context.getInputStream().toString();

        token.capturedRange.start = token.matchedRange.start = 0;
        token.capturedRange.end = token.matchedRange.end = source.length;
        token.value = source;
        token.name = 'SameRandomName';

        return result;
      }),
    );

    expect(result).toMatchSnapshot();
  });
});
