/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Context,
  Equals,
  Fetch,
  Iterate,
  Matches,
  Optional,
  Skip,
} = Matchers;

describe('/Core/Matchers/IterateMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: '1 5 10 15 20 25' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Iterate(
        Matches(/\d+/).name('Number'),
        Skip(Optional(Matches(/\s+/).name('Space'))),
      ).name('Repeated').start(0).end(4),
    );

    expect(result).toMatchSnapshot();
  });

  it('can specify range and step', async () => {
    parser = new Parser({ source: '4 6 8 10 12 14' });

    let result = await parser.exec(
      Iterate(
        Equals(Fetch('Repeated.index')).name('Number'),
        Skip(Optional(Matches(/\s+/).name('Space'))),
      ).name('Repeated').start(4).end(9).step(2),
    );

    expect(result).toMatchSnapshot();
  });

  it('range and step can be fetched', async () => {
    parser = new Parser({ source: '4 6 8 10 12 14' });

    let result = await parser.exec(
      Context(
        Iterate(
          Equals(Fetch('Repeated.index')).name('Number'),
          Skip(Optional(Matches(/\s+/).name('Space'))),
        ).name('Repeated').start(Fetch('start')).end(Fetch('end')).step(Fetch('step')),
        {
          start:  4,
          end:    9,
          step:   2,
        },
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
