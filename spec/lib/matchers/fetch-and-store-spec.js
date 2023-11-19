/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Fetch,
  Store,
  Switch,
} = Matchers;

/*active*/fdescribe('/Core/Matchers/Fetch and Store', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Testing Testing' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals(Fetch('Value')).name('First')),
        Equals(' ').name('Space'),
        Equals(Fetch('CapturedValue')).name('Second'),
      ).name('Program'),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  it('works with tokens directly', async () => {
    parser = new Parser({ source: 'Testing Derp' });

    let result = await parser.exec(
      Program(
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals(Fetch('Value')).name('First')),
        Fetch('CapturedValue'),
      ).name('Program'),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  it('works with current scope', async () => {
    let result = await parser.exec(
      Program(
        Switch(Fetch('_')),
      ).name('Program'),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });
});
