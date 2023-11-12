/* eslint-disable no-magic-numbers */

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Program,
  Panic,
} = Matchers;

describe('/Core/Matchers/PanicMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234', fileName: 'test.script' });
  });

  it('works', async () => {
    try {
      await parser.tokenize(
        Program('TestProgram',
          Equals('Test'),
          Panic('Hot Dawg!'),
        ),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toBe('Hot Dawg!');
      expect(error.lineStart).toEqual(1);
      expect(error.lineEnd).toEqual(1);
      expect(error.columnStart).toEqual(4);
      expect(error.columnEnd).toEqual(9);
      expect(error.parserContext).not.toBeNull();
      expect(error.parserContext.range.start).toEqual(4);
      expect(error.parserContext.range.end).toEqual(9);
      expect(error.parserContext.getFileName()).toEqual('test.script');
      expect(error.parserContext.getSource()).toEqual('Test 1234');
    }
  });
});
