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

fdescribe('/Core/Matchers/Fetch and Store', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Testing Testing' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('Program',
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals('First', Fetch('Value'))),
        Equals('Space', ' '),
        Equals('Second', Fetch('CapturedValue')),
      ),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  it('works with tokens directly', async () => {
    parser = new Parser({ source: 'Testing Derp' });

    let result = await parser.exec(
      Program('Program',
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals('First', Fetch('Value'))),
        Fetch('CapturedValue'),
      ),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  it('works with current scope', async () => {
    let result = await parser.exec(
      Program('Program',
        Switch(Fetch('_')),
      ),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });
});
