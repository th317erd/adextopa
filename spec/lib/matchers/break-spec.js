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

    expect(snapshot(result)).toBe('cd1290421c814ace91ee31dc6efb22b4');
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

    expect(snapshot(result)).toBe('09e2961bc5d3cdac8127f83dfb11dff6');
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

    expect(snapshot(result)).toBe('f131479e79c7753467b35b2a009a6a8f');
  });
});
