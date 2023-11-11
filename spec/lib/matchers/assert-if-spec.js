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

      expect(snapshot(result)).toBe('1aed42ed7236d48605e88fa02a0ef6d2');
    } catch (error) {
      fail('unreachable!');
    }
  });
});
