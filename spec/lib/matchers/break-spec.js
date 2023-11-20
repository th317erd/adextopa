/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Break,
  Skip,
  Equals,
  Loop,
  Matches,
  Optional,
  Switch,
} = Matchers;

fdescribe('/Core/Matchers/BreakMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '1 5 10 derp 15 20 25' });
  });

  it('works', async () => {
    const SpaceOrNumber = Switch(
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
      Break(),
    );

    let result = await parser.exec(
      Loop(SpaceOrNumber).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('can target named loops', async () => {
    parser = new Parser({ source: '(1 5) (10 derp) (6 2)' });

    const SpaceOrNumber = Switch(
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
      Break('TestProgram'),
    );

    let result = await parser.exec(
      Loop(
        Optional(Equals(' ').name('Space')),
        Skip(Equals('(').name('OpeningParenthesis')),
        Loop(
          SpaceOrNumber,
        ).name('Numbers'),
        Skip(Equals(')').name('ClosingParenthesis')),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with compound loops', async () => {
    parser = new Parser({ source: '(1 5) (10 derp) (6 2)' });

    const SpaceOrNumber = Switch(
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
      Break(),
    );

    let result = await parser.exec(
      Loop(
        Skip(Matches(/\D+/).name('NotANumber')),
        Loop(
          SpaceOrNumber,
        ).name('Numbers'),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
