/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Matchers,
  Script,
} from '../../../../lib/index.js';

const {
  Loop,
  Switch,
  Line,
} = Matchers;

const {
  V1: {
    Matchers: {
      LineComment,
      BlockComment,
    },
  },
} = Script;

describe('/Script/V1/Comment', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Hello world\n\n// Testing a comment\n/* Block\nComment\nhere! */ \n\n// Final comment \nHello line 2' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Loop(
        Switch(
          BlockComment(),
          LineComment(),
          Line(),
        ),
      ).name('TestComments'),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with line comments without ending newline', async () => {
    parser = new Parser({ source: '// Testing a comment' });

    let result = await parser.exec(LineComment());
    expect(result).toMatchSnapshot();
  });

  it('works with block comments without ending newline', async () => {
    parser = new Parser({ source: '/* Testing a comment */' });

    let result = await parser.exec(BlockComment());
    expect(result).toMatchSnapshot();
  });
});
