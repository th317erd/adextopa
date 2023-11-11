/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

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

describe('LoopMatcher', () => {
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

    expect(snapshot(result)).toBe('6433491943b37f3f3a98773388e56e72');
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

    expect(snapshot(result)).toBe('be56974fa2ec9730295549350e306e7f');
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

    expect(snapshot(result)).toBe('5eab312292c63bbfce5d732803ab8bd6');
  });
});
