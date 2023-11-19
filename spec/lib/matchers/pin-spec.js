/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Matches,
  Pin,
} = Matchers;

describe('/Core/Matchers/PinMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test World' });
  });

  it('works', async () => {
    const Word = Matches(/\w+/).name('Word');

    // Here we get a success, even though
    // we only end up matching the range 'Test '.
    // This is because the pin never moves
    // the cursor, and so even though the
    // match is successful, the match is
    // discarded, as though it didn't
    // happen.

    let result = await parser.exec(
      Program(
        Word,
        Equals(' '),
        Pin(Word),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('works when match fails', async () => {
    const Word = Matches(/\w+/).name('Word');

    let result = await parser.exec(
      Program(
        Word,
        Equals(' '),
        Pin(Equals('Derp')),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
