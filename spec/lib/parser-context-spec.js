/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import {
  Parser,
  ParserContext,
  Token,
} from '../../lib/index.js';

import { InputStream } from '../../lib/input-stream.js';

fdescribe('ParserContext', () => {
  let context;
  let parser;

  beforeEach(() => {
    parser = new Parser({
      source:   'Line1\nLine2\nLine3\nLine4\n',
      fileName: './test.something',
    });

    context = new ParserContext(parser, parser.getOptions());
  });

  describe('getParser', () => {
    it('works', () => {
      expect(context.getParser()).toBe(parser);
    });
  });

  describe('getInputStream', () => {
    it('works', () => {
      expect(context.getInputStream()).toBe(parser.getInputStream());
    });

    it('will create an input stream if none exists', () => {
      parser.inputStream = null;
      expect(parser.getInputStream()).toBe(null);

      expect(context.getInputStream()).toBeInstanceOf(InputStream);
    });
  });

  describe('getFileName', () => {
    it('works', () => {
      expect(context.getFileName()).toBe('./test.something');
    });
  });

  describe('getLineAtOffset', () => {
    it('works', () => {
      expect(context.getLineAtOffset(0)).toBe(1);
      expect(context.getLineAtOffset(4)).toBe(1);
      expect(context.getLineAtOffset(6)).toBe(2);
      expect(context.getLineAtOffset(12)).toBe(3);
    });
  });

  describe('getColumnAtOffset', () => {
    it('works', () => {
      expect(context.getColumnAtOffset(0)).toBe(1);
      expect(context.getColumnAtOffset(4)).toBe(5);
      expect(context.getColumnAtOffset(6)).toBe(1);
      expect(context.getColumnAtOffset(7)).toBe(2);
      expect(context.getColumnAtOffset(8)).toBe(3);
      expect(context.getColumnAtOffset(9)).toBe(4);
      expect(context.getColumnAtOffset(10)).toBe(5);
      expect(context.getColumnAtOffset(11)).toBe(6);
      expect(context.getColumnAtOffset(12)).toBe(1);
    });
  });

  describe('resolveValue', () => {
    it('works', () => {
      const FAKE = {
        toString: () => 'yoot',
      };

      expect(('' + context.resolveValue(FAKE))).toBe('yoot');
      expect(context.resolveValue('derp')).toBe('derp');
      expect(context.resolveValue(undefined)).toBe(undefined);
      expect(context.resolveValue(null)).toBe(null);
    });
  });

  describe('resolveValue', () => {
    it('works', () => {
      const token = new Token(context, null, { value: 'hello' });

      const FAKE = {
        toString: () => 'yoot',
        toValue:  () => token,
      };

      expect(('' + context.resolveValue(FAKE))).toBe('yoot');
      expect(context.resolveValue('derp')).toBe('derp');
      expect(context.resolveValue(undefined)).toBe(undefined);
      expect(context.resolveValue(null)).toBe(null);
    });
  });

  describe('prepareError', () => {
    it('works', () => {
      context.parserRange.addToStart(7);

      let error = context.prepareError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.parserContext).toBe(context);
      expect(error.lineStart).toBe(2);
      expect(error.lineEnd).toBe(5);
      expect(error.columnStart).toBe(2);
      expect(error.columnEnd).toBe(1);
    });
  });
});
