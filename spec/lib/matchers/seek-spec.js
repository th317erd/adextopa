/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

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

describe('/Core/Matchers/SeekMatcher', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test World' });
  });

  describe('parseRange', () => {
    it('works', () => {
      let context = new ParserContext(parser);
      let seek    = Seek();

      const p = (value) => seek.parseRange(context, value);

      expect(p()).toMatchSnapshot();
      expect(p('')).toMatchSnapshot();
      expect(p(null)).toMatchSnapshot();
      expect(p(':')).toMatchSnapshot();
      expect(p('')).toMatchSnapshot();
      expect(p(new SourceRange(1, 4))).toMatchSnapshot();
      expect(p(2)).toMatchSnapshot();
      expect(p(-2)).toMatchSnapshot();
      expect(p([ 1, 4 ])).toMatchSnapshot();
      expect(p([ 4, 1 ])).toMatchSnapshot();
      expect(p([ undefined, 4 ])).toMatchSnapshot();
      expect(p([ -Infinity, 4 ])).toMatchSnapshot();
      expect(p([ null, 4 ])).toMatchSnapshot();
      expect(p([ Infinity, 4 ])).toMatchSnapshot();
      expect(p([ 1, undefined ])).toMatchSnapshot();
      expect(p([ 1, Infinity ])).toMatchSnapshot();
      expect(p([ 1, -Infinity ])).toMatchSnapshot();
      expect(p('0:1')).toMatchSnapshot();
      expect(p('-0:1')).toMatchSnapshot();
      expect(p('-2:-5')).toMatchSnapshot();
      expect(p(':-5')).toMatchSnapshot();
      expect(p('-0:')).toMatchSnapshot();
      expect(p('0:')).toMatchSnapshot();
      expect(p(':1')).toMatchSnapshot();
    });
  });

  describe('getAbsoluteRange', () => {
    it('works', () => {
      let context = new ParserContext(parser);
      let seek    = Seek();

      const p = (value) => seek.getAbsoluteRange(context, value);

      expect(p()).toMatchSnapshot();
      expect(p('')).toMatchSnapshot();
      expect(p(null)).toMatchSnapshot();
      expect(p(':')).toMatchSnapshot();
      expect(p('')).toMatchSnapshot();
      expect(p(new SourceRange(1, 4))).toMatchSnapshot();
      expect(p(2)).toMatchSnapshot();

      expect(p(-2)).toMatchSnapshot();

      context.range.start = 4;
      expect(p(-2)).toMatchSnapshot();
      context.range.start = 0;

      expect(p([ 1, 4 ])).toMatchSnapshot();
      expect(p([ 4, 1 ])).toMatchSnapshot();
      expect(p([ undefined, 4 ])).toMatchSnapshot();
      expect(p([ -Infinity, 4 ])).toMatchSnapshot();
      expect(p([ null, 4 ])).toMatchSnapshot();
      expect(p([ Infinity, 4 ])).toMatchSnapshot();
      expect(p([ 1, undefined ])).toMatchSnapshot();
      expect(p([ 1, Infinity ])).toMatchSnapshot();
      expect(p([ 1, -Infinity ])).toMatchSnapshot();
      expect(p('0:1')).toMatchSnapshot();
      expect(p('-0:1')).toMatchSnapshot();

      expect(p('-2:-5')).toMatchSnapshot();

      context.range.start = 3;
      expect(p('-2:-5')).toMatchSnapshot();
      context.range.start = 0;

      expect(p('+2:2')).toMatchSnapshot();

      context.range.end = 7;
      expect(p('+2:2')).toMatchSnapshot();

      context.range.start = 1;
      context.range.end = 4;
      expect(p('-0:')).toMatchSnapshot();
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

    expect(result).toMatchSnapshot();
  });

  it('works without a range', async () => {
    const Word = Matches(/\w+/);

    let result = await parser.tokenize(
      Program(
        Word,
        Equals(' '),
        Seek(Word),
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with only a range', async () => {
    const Word = Matches(/\w+/);

    let result = await parser.tokenize(
      Program(
        Store('Location', Fetch('@.range')),
        Word,
        Equals(' '),
        Seek(Fetch('Location')),
        Word,
      ),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with strings for names', async () => {
    const Word = Matches(/\w+/);

    let result = await parser.tokenize(
      Program(
        Store('Location', Fetch('@.range')),
        Word,
        Equals(' '),
        Seek('Location'),
        Word,
      ),
    );

    expect(result).toMatchSnapshot();
  });
});
