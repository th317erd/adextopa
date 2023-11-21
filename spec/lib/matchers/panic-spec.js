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
      await parser.exec(
        Program(
          Equals('Test'),
          Panic('Hot Dawg!'),
        ).name('TestProgram'),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toBe('Hot Dawg!');
      expect(error.lineStart).toEqual(1);
      expect(error.lineEnd).toEqual(1);
      expect(error.columnStart).toEqual(5);
      expect(error.columnEnd).toEqual(10);
      expect(error.parserContext).not.toBeNull();
      expect(error.parserContext.parserRange.start).toEqual(4);
      expect(error.parserContext.parserRange.end).toEqual(9);
      expect(error.parserContext.getFileName()).toEqual('test.script');
      expect(error.parserContext.getInputStream().toString()).toEqual('Test 1234');
    }
  });
});
