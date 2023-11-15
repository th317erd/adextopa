/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import {
  Parser,
  ParserContext,
  Token,
  SourceRange,
} from '../../lib/index.js';

describe('Token', () => {
  let context;

  beforeEach(() => {
    let parser = new Parser({
      source:   'Testing 1234',
      fileName: './test.something',
    });

    context = new ParserContext(parser, parser.getOptions());
  });

  describe('new', () => {
    it('works', () => {
      let token = new Token(context);
      expect(token.toJSON()).toEqual({
        $type:          'Token',
        name:           'Token',
        parent:         null,
        value:          null,
        capturedValue:  'Testing 1234',
        matchedValue:   'Testing 1234',
        capturedRange:  { $type: 'SourceRange', start: 0, end: 12, relative: false },
        matchedRange:   { $type: 'SourceRange', start: 0, end: 12, relative: false },
        children:       [],
        proxyChildren:  false,
      });

      token = new Token(context, token, {
        capturedRange:  new SourceRange(2, 10),
        matchedRange:   new SourceRange(1, 11),
        value:          { derp: true },
        name:           'TestToken',
      });

      expect(token.toJSON()).toEqual({
        $type:          'Token',
        name:           'TestToken',
        parent:         { $ref: '0#' },
        value:          { derp: true },
        capturedValue:  'sting 12',
        matchedValue:   'esting 123',
        capturedRange:  { $type: 'SourceRange', start: 2, end: 10, relative: false },
        matchedRange:   { $type: 'SourceRange', start: 1, end: 11, relative: false },
        children:       [],
        proxyChildren:  false,
      });
    });
  });

  describe('getRangeBounds', () => {
    it('works', () => {
      let token = new Token(context);

      token.addChild(new Token(context, token, {
        capturedRange:  new SourceRange(8, 9),
        matchedRange:   new SourceRange(7, 10),
      }));

      expect(token.getRangeBounds('capturedRange').toJSON()).toEqual({
        $type:    'SourceRange',
        start:    8,
        end:      9,
        relative: false,
      });

      expect(token.getRangeBounds('matchedRange').toJSON()).toEqual({
        $type:    'SourceRange',
        start:    7,
        end:      10,
        relative: false,
      });

      token.addChild(new Token(context, token, {
        capturedRange:  new SourceRange(6, 11),
        matchedRange:   new SourceRange(4, 12),
      }));

      expect(token.getRangeBounds('capturedRange').toJSON()).toEqual({
        $type:    'SourceRange',
        start:    6,
        end:      11,
        relative: false,
      });

      expect(token.getRangeBounds('matchedRange').toJSON()).toEqual({
        $type:    'SourceRange',
        start:    4,
        end:      12,
        relative: false,
      });
    });
  });
});