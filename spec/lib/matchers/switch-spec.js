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
  Skip,
  Switch,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/SwitchMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    const NameOrNumber = Switch(
      Matches(/test/i).name('Name'),
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
    );

    let result = await parser.exec(
      Program(
        NameOrNumber,
        NameOrNumber,
        NameOrNumber,
      ).name('TestProgram'),
      // { debug: true },
    );

    // console.log(_TestHelpers.inspect(result));

    expect(result).toMatchSnapshot();
  });

  it('works when skipping by more than zero', async () => {
    parser = new Parser({ source: ' ' });

    const NameOrNumber = Switch(
      Matches(/test/i).name('Name'),
      Equals(' ').name('Space'),
      Matches(/\d+/).name('Number'),
    );

    let result = await parser.exec(
      Program(
        Switch(
          Skip(Matches(/\s+/).name('Whitespace')),
          NameOrNumber,
        ),
      ).name('TestProgram'),
    );

    expect(result).toMatchSnapshot();
  });
});
