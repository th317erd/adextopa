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

    expect(snapshot(result)).toBe('ec849c2b4452f1c7538f193a18f1d244');

    result = await parser.tokenize(
      Program('TestProgram',
        Equals('Test'),
      ),
    );

    expect(snapshot(result)).toBe('f35efd3f29e60f5bdc76617bdf08f920');
  });
});
