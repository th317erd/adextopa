/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Break,
  Discard,
  Equals,
  Loop,
  Matches,
  Optional,
  Switch,
} = Matchers;

describe('/Core/Matchers/BreakMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '1 5 10 derp 15 20 25' });
  });

  it('works', async () => {
    const SpaceOrNumber = Switch(
      Equals('Space', ' '),
      Matches('Number', /\d+/),
      Break(),
    );

    let result = await parser.tokenize(
      Loop('TestProgram', SpaceOrNumber),
    );

    expect(result).toMatchSnapshot();
  });

  it('can target named loops', async () => {
    parser = new Parser({ source: '(1 5) (10 derp) (6 2)' });

    const SpaceOrNumber = Switch(
      Equals('Space', ' '),
      Matches('Number', /\d+/),
      Break('TestProgram'),
    );

    let result = await parser.tokenize(
      Loop('TestProgram',
        Optional(Equals('Space', ' ')),
        Discard(Equals('OpeningParenthesis', '(')),
        Loop('Numbers',
          SpaceOrNumber,
        ),
        Discard(Equals('ClosingParenthesis', ')')),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with compound loops', async () => {
    parser = new Parser({ source: '(1 5) (10 derp) (6 2)' });

    const SpaceOrNumber = Switch(
      Equals('Space', ' '),
      Matches('Number', /\d+/),
      Break(),
    );

    let result = await parser.tokenize(
      Loop('TestProgram',
        Discard(Matches('NotANumber', /\D+/)),
        Loop('Numbers',
          SpaceOrNumber,
        ),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
