const FULL_TEXT = `testing 123
some other line
something else
what about this?
what are you thinking?
this is getting too long for unit tests...
seriously...`;

const { Parser, SourceRange, Token } = require('./lib');

describe("Parser", function() {
  describe("clone", function() {
    it("should be able to clone", function() {
      var parser1 = new Parser('testing 123'),
          parser2 = parser1.clone();

      expect(!parser2).toBe(false);
      expect(!parser2.getSourceAsString()).toBe(false);
      expect(parser1 === parser2).toBe(false);
      expect(parser1.getSourceAsString()).toBe(parser2.getSourceAsString());
      expect(parser1.getOptions()).not.toBe(parser2.getOptions());
    });
  });

  describe("getSourceRangeClass", function() {
    it("should be able to get SourceRange class", function() {
      var parser = new Parser('testing 123');
      expect(parser.getSourceRangeClass()).toBe(SourceRange);
    });
  });

  describe("getTokenClass", function() {
    it("should be able to get Token class", function() {
      var parser = new Parser('testing 123');
      expect(parser.getTokenClass()).toBe(Token);
    });
  });

  describe("getOptions", function() {
    it("should be able to get options", function() {
      var opts = {
            fileName: 'test.txt'
          },
          parser = new Parser('testing 123', opts);
      expect(parser.getOptions()).toEqual(opts);
    });
  });

  describe("addError/getErrors", function() {
    it("should be able to add an error", function() {
      var parser = new Parser('testing 123');
      parser.addError('test error');
      expect(parser.getErrors()).toEqual([ 'test error' ]);
    });
  });

  describe("getVersion", function() {
    it("should be able to get library version", function() {
      var parser = new Parser('testing 123');
      expect(parser.getVersion()).toBe('0.1.0');
      expect(Parser.VERSION).toBe('0.1.0');
    });
  });

  describe("getSourceAsString", function() {
    it("should be able to get source as a string", function() {
      var parser = new Parser('testing 123');
      expect(parser.getSourceAsString()).toBe('testing 123');
    });
  });

  describe("getSourceRangeAsString", function() {
    it("should be able to get source range as a string", function() {
      var parser = new Parser('testing 123');
      expect(parser.getSourceRangeAsString(1, 7)).toBe('esting');
      expect(parser.getSourceRangeAsString(new SourceRange(parser, 2, 6))).toBe('stin');
    });
  });

  describe("getLineNumber", function() {
    it("should be able to get source line number at offset", function() {
      var parser = new Parser(FULL_TEXT);
      expect(parser.getLineNumber(parser.getSourceAsString(), 0)).toBe(1);
      expect(parser.getLineNumber(parser.getSourceAsString(), 16)).toBe(2);
      expect(parser.getLineNumber(parser.getSourceAsString(), 30)).toBe(3);
    });
  });

  describe("findNearestNewline", function() {
    it("should be able to get find the closest line number before offset", function() {
      var parser = new Parser(FULL_TEXT);
      expect(parser.findNearestNewline(parser.getSourceAsString(), 0)).toBe(0);
      expect(parser.findNearestNewline(parser.getSourceAsString(), 16)).toBe(11);
      expect(parser.findNearestNewline(parser.getSourceAsString(), 30)).toBe(27);
    });
  });

  describe("findNearestNewline", function() {
    it("should be able to get column at offset", function() {
      var parser = new Parser(FULL_TEXT);
      expect(parser.getColumnNumber(parser.getSourceAsString(), 5)).toBe(5);
      expect(parser.getColumnNumber(parser.getSourceAsString(), 17)).toBe(6);
      expect(parser.getColumnNumber(parser.getSourceAsString(), 30)).toBe(3);
    });
  });

  describe("getLinesAndColumnsFromRange", function() {
    it("should be able to get line and column information from range", function() {
      var parser = new Parser(FULL_TEXT);

      expect(parser.getLinesAndColumnsFromRange(parser.getSourceAsString())).toEqual({
        startLine:    1,
        endLine:      7,
        startColumn:  1,
        endColumn:    13
      });

      expect(parser.getLinesAndColumnsFromRange(parser.getSourceAsString(), 14, 35)).toEqual({
        startLine:    2,
        endLine:      3,
        startColumn:  3,
        endColumn:    8
      });

      expect(parser.getLinesAndColumnsFromRange(parser.getSourceAsString(), new SourceRange(parser, 14, 35))).toEqual({
        startLine:    2,
        endLine:      3,
        startColumn:  3,
        endColumn:    8
      });
    });
  });
});
