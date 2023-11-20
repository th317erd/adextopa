/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import {
  Parser,
  ParserContext,
  Token,
  SourceRange,
} from '../../lib/index.js';

/*active*/fdescribe('Token', () => {
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
        parent:         null,
        capturedValue:  '',
        matchedValue:   '',
        capturedRange:  { $type: 'SourceRange', start: 0, end: 0, relative: false },
        matchedRange:   { $type: 'SourceRange', start: 0, end: 0, relative: false },
        children:       [],
        attributes:     {
          proxyChildren:  false,
          name:           'Token',
          value:          null,
        },
      });

      token = (new Token(context, token, {
        capturedRange:  new SourceRange(2, 10),
        matchedRange:   new SourceRange(1, 11),
        name:           'TestToken',
      })).setAttribute('value', { derp: true });

      expect(token.toJSON()).toEqual({
        $type:          'Token',
        parent:         { $ref: '0#' },
        capturedValue:  'sting 12',
        matchedValue:   'esting 123',
        capturedRange:  { $type: 'SourceRange', start: 2, end: 10, relative: false },
        matchedRange:   { $type: 'SourceRange', start: 1, end: 11, relative: false },
        children:       [],
        attributes:     {
          proxyChildren:  false,
          name:           'TestToken',
          value:          { derp: true },
        },
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
