/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
  ParserContext,
  SourceRange,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Matches,
  Seek,
  Store,
  Fetch,
} = Matchers;

describe('SeekMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test World' });
  });

  describe('parseRange', () => {
    it('works', () => {
      let context = new ParserContext(parser);
      let seek    = Seek();

      const p = (value, debug) => snapshot(seek.parseRange(context, value), debug);

      expect(p()).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p('')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(null)).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(':')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p('')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(new SourceRange(1, 4))).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p(2)).toBe('b16b5f99a39a0f1dcb867e07e2524984');
      expect(p(-2)).toBe('c2b5445a6e76acedd8cc0800a4c48a52');
      expect(p([ 1, 4 ])).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p([ 4, 1 ])).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p([ undefined, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ -Infinity, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ null, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ Infinity, 4 ])).toBe('b0579455af6485cf829c47d2ade8a891');
      expect(p([ 1, undefined ])).toBe('c42e94e8f88c24aebcbb043b23ebd7f7');
      expect(p([ 1, Infinity ])).toBe('c42e94e8f88c24aebcbb043b23ebd7f7');
      expect(p([ 1, -Infinity ])).toBe('b2204e3d1f77db45c4e8602d539669f0');
      expect(p('0:1')).toBe('b2204e3d1f77db45c4e8602d539669f0');
      expect(p('-0:1')).toBe('793b22c7c50ef0ad3fd2e9f40900a7de');
      expect(p('-2:-5')).toBe('b4e04118d9914ba403b48d7efc1a4842');
      expect(p(':-5')).toBe('8839c3ea949c5d533374d18c437a2877');
      expect(p('-0:')).toBe('55d4792257d6688208a04c011c24d0b9');
      expect(p('0:')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(':1')).toBe('b2204e3d1f77db45c4e8602d539669f0');
    });
  });

  describe('getAbsoluteRange', () => {
    it('works', () => {
      let context = new ParserContext(parser);
      let seek    = Seek();

      const p = (value, debug) => snapshot(seek.getAbsoluteRange(context, value), debug);
      expect(p()).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p('')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(null)).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(':')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p('')).toBe('8888f68a92f4cc0fd514ed961271cd76');
      expect(p(new SourceRange(1, 4))).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p(2)).toBe('b16b5f99a39a0f1dcb867e07e2524984');

      expect(p(-2)).toBe('8888f68a92f4cc0fd514ed961271cd76');

      context.range.start = 4;
      expect(p(-2)).toBe('b16b5f99a39a0f1dcb867e07e2524984');
      context.range.start = 0;

      expect(p([ 1, 4 ])).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p([ 4, 1 ])).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
      expect(p([ undefined, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ -Infinity, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ null, 4 ])).toBe('c5ec4b9d1ba176a66816cfb60203572f');
      expect(p([ Infinity, 4 ])).toBe('b0579455af6485cf829c47d2ade8a891');
      expect(p([ 1, undefined ])).toBe('c42e94e8f88c24aebcbb043b23ebd7f7');
      expect(p([ 1, Infinity ])).toBe('c42e94e8f88c24aebcbb043b23ebd7f7');
      expect(p([ 1, -Infinity ])).toBe('b2204e3d1f77db45c4e8602d539669f0');
      expect(p('0:1')).toBe('b2204e3d1f77db45c4e8602d539669f0');
      expect(p('-0:1')).toBe('8888f68a92f4cc0fd514ed961271cd76');

      expect(p('-2:-5')).toBe('1d9feb502e6e0799e3522df9891b84c5');

      context.range.start = 3;
      expect(p('-2:-5')).toBe('478d9ff4136cadd67228b660b971a3e9');
      context.range.start = 0;

      expect(p('+2:2')).toBe('b16b5f99a39a0f1dcb867e07e2524984');

      context.range.end = 7;
      expect(p('+2:2')).toBe('6c90aaed1c14cc339b3122022f142ded');

      context.range.start = 1;
      context.range.end = 4;
      expect(p('-0:')).toBe('8b923e85b4c0ec4e7babb5145c9b304a');
    });
  });

  it('works', async () => {
    const Word = Matches(/\w+/);

    let result = await parser.tokenize(
      Program(
        Store('Location', Fetch('@.range')),
        Word,
        Equals(' '),
        Seek(
          Fetch('Location'),
          Word,
        ),
        Word,
      ),
    );

    expect(snapshot(result)).toBe('b05c9d2884c7e628730262b9ca487f47');
  });
});
