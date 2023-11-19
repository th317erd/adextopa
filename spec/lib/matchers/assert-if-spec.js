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
  AssertIf,
} = Matchers;

describe('/Core/Matchers/AssertIfMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    try {
      await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Equals(' ').name('Space'),
          AssertIf('Oh no! Not a number!', Matches(/\d+/).name('Number')),
        ).name('TestProgram'),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toEqual('Oh no! Not a number!');
    }
  });

  it('properly is ignored on success', async () => {
    try {
      let result = await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Equals(' ').name('Space'),
          AssertIf('Oh no! Not a number!', Matches(/[a-z]+/).name('NotANumber')),
          Matches(/\d+/).name('Number'),
        ).name('TestProgram'),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      fail('unreachable!');
    }
  });
});
