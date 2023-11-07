/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Map,
  Equals,
} = Matchers;

describe('MapMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Map(Equals('Test'), ({ result, value, context }) => {
        let source = context.getSource();

        value.capturedRange.start = value.matchedRange.start = 0;
        value.capturedRange.end = value.matchedRange.end = source.length;
        value.capturedValue = source;
        value.matchedValue = source;
        value.name = 'SameRandomName';

        return result;
      }),
    );

    expect(snapshot(result)).toBe('fdb2e4e70c092b07e5384c965b7ad784');
  });
});
