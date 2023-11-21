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
      Program(
        Store('Matcher', 'Testing'),
        Register('CaptureValue', Equals(Fetch('Matcher')).name('Second')),
        Call('CaptureValue').name('First'), // name = 'First'
        Equals(' ').name('Space'),
        Call('CaptureValue'), // name = 'Second'
      ).name('Program'),
    );

    expect(result).toMatchSnapshot();
  });

  it('setting the name works', async () => {
    let result = await parser.exec(
      Program(
        Store('Matcher', 'Testing'),
        Register(Equals(Fetch('Matcher')).name('Second')).name('DerpyValue'),
        Call('DerpyValue').name('First'), // name = 'First'
        Equals(' ').name('Space'),
        Call('DerpyValue'), // name = 'Second'
      ).name('Program'),
    );

    expect(result).toMatchSnapshot();
  });
});
