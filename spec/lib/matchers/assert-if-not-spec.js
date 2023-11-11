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

      expect(snapshot(result)).toBe('1aed42ed7236d48605e88fa02a0ef6d2');
    } catch (error) {
      fail('unreachable!');
    }
  });
});
