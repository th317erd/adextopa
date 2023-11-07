/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Program,
  Not,
} = Matchers;

describe('NotMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('TestProgram',
        Not(Equals('Test')),
      ),
    );

    expect(snapshot(result)).toBe('f422a58ba23e3efd2976e9dfdb155799');

    result = await parser.tokenize(
      Program('TestProgram',
        Equals('Test'),
      ),
    );

    expect(snapshot(result)).toBe('c64811628b75d72925aca4f18b1f6f53');
  });
});
