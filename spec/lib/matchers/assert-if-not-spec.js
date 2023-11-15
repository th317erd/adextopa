/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

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

describe('/Core/Matchers/AssertIfNotMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    try {
      await parser.exec(
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
      let result = await parser.exec(
        Program('TestProgram',
          Matches('Name', /test/i),
          Equals('Space', ' '),
          AssertIfNot('Oh no! Expected a number!', Matches('Number', /\d+/)),
          Matches('Number', /\d+/),
        ),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      fail('unreachable!');
    }
  });
});
