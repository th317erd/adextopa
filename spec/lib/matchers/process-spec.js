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

/*active*/fdescribe('/Core/Matchers/ProcessMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    parser = new Parser({ source: '1234' });

    let result = await parser.exec(
      Loop(Matches(/\d/).name('Number')).name('TestProgram'),
      // { debug: true },
    );

    expect(result).toMatchSnapshot();
  });

  it('works with a Switch', async () => {
    const NameOrNumber = Switch(
      Matches(/test/i).name('Name'),
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
    );

    let result = await parser.exec(
      Loop(NameOrNumber).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });

  it('can iterate', async () => {
    parser = new Parser({ source: '1 5 10 15 20 25' });

    let result = await parser.exec(
      Iterate(
        Matches(/\d+/).name('Number'),
        Skip(Optional(Matches(/\s+/).name('Space'))),
      ).name('Repeated').start(0).end(4),
    );

    expect(result).toMatchSnapshot();
  });
});
