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
  AssertIfNot,
} = Matchers;

describe('AssertIfNotMatcher', () => {
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
          AssertIfNot('Oh no! Expected a number!', Matches('NotANumber', /[a-z]+/)),
        ),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toEqual('Oh no! Expected a number!');
    }
  });

  it('properly is ignored on success', async () => {
    try {
      let result = await parser.tokenize(
        Program('TestProgram',
          Matches('Name', /test/i),
          Equals('Space', ' '),
          AssertIfNot('Oh no! Expected a number!', Matches('Number', /\d+/)),
          Matches('Number', /\d+/),
        ),
      );

      expect(snapshot(result)).toBe('6756d0561ea04a5b9b6205e9b3e7ed6c');
    } catch (error) {
      fail('unreachable!');
    }
  });
});
