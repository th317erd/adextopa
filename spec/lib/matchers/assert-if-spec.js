/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Matches,
  Program,
  AssertIf,
} = Matchers;

describe('AssertIfMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    try {
      await parser.tokenize(
        Program('TestProgram',
          Matches('Name', /test/i),
          Equals('Space', ' '),
          AssertIf('Oh no! Not a number!', Matches('Number', /\d+/)),
        ),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toEqual('Oh no! Not a number!');
    }
  });

  it('properly is ignored on success', async () => {
    try {
      let result = await parser.tokenize(
        Program('TestProgram',
          Matches('Name', /test/i),
          Equals('Space', ' '),
          AssertIf('Oh no! Not a number!', Matches('NotANumber', /[a-z]+/)),
          Matches('Number', /\d+/),
        ),
      );

      expect(snapshot(result)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
    } catch (error) {
      fail('unreachable!');
    }
  });
});
