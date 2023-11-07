/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

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

describe('ScriptV1CommentMatcher', () => {
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

    expect(snapshot(result)).toBe('1e6b85196497051d7bc3ebe6ce2f8c6c');
  });
});
