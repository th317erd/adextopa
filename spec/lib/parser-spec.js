/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import {
  Parser,
} from '../../lib/index.js';

import { InputStream } from '../../lib/input-stream.js';

describe('Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({
      source:   'Line1\nLine2\nLine3\nLine4\n',
      fileName: './test.something',
    });
  });

  describe('getInputStream', () => {
    it('works', () => {
      expect(parser.getInputStream()).toBeInstanceOf(InputStream);
    });
  });

  describe('getOptions', () => {
    it('works', () => {
      expect(parser.getOptions()).toEqual({
        source:   'Line1\nLine2\nLine3\nLine4\n',
        fileName: './test.something',
      });
    });
  });

  describe('clone', () => {
    it('works', () => {
      let newParser = parser.clone();
      expect(newParser).not.toBe(parser);
      expect(newParser.getInputStream()).not.toBe(parser.getInputStream());

      newParser = parser.clone({ inputStream: parser.getInputStream() });
      expect(newParser).not.toBe(parser);
      expect(newParser.getInputStream()).toBe(parser.getInputStream());
    });
  });
});
