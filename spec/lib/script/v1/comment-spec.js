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
      Comment,
    },
  },
} = Script;

describe('/Script/V1/Comment', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Hello world\n\n# Testing a comment\n#Another comment\n\n# Final comment\nHello line 2' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Loop('TestComments',
        Switch(
          Comment(),
          Line(),
        ),
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
