/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Matches,
  Skip,
  Switch,
  Loop,
  Iterate,
  Optional,
} = Matchers;

describe('/Core/Matchers/LoopMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    const NameOrNumber = Switch(
      Matches('Name', /test/i),
      Equals('Space', ' '),
      Matches('Number', /\d+/),
    );

    let result = await parser.tokenize(
      Loop('TestProgram', NameOrNumber),
    );

    expect(result).toMatchSnapshot();
  });

  it('can iterate', async () => {
    parser = new Parser({ source: '1 5 10 15 20 25' });

    let result = await parser.tokenize(
      Iterate('Repeated', 0, 4,
        Matches('Number', /\d+/),
        Skip(Optional(Matches('Space', /\s+/))),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
