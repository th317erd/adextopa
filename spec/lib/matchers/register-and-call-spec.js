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
  Call,
  Register,
} = Matchers;

describe('/Core/Matchers/Register and Call', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Testing Testing' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program('Program',
        Store('Matcher', 'Testing'),
        Register('CaptureValue', Equals('Second', Fetch('Matcher'))),
        Call('First', 'CaptureValue'), // name = 'First'
        Equals('Space', ' '),
        Call('CaptureValue'), // name = 'Second'
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
