const { Parser, SourceRange } = require('./lib');

describe("SourceRange", function() {
  describe("clone", function() {
    it("should be able to clone", function() {
      var parser        = new Parser('testing 123'),
          sourceRange1  = new SourceRange(parser, 1, 6),
          sourceRange2  = sourceRange1.clone();

      expect(!sourceRange2).toBe(false);
      expect(sourceRange1 === sourceRange2).toBe(false);
      expect(sourceRange1.getParser()).toBe(parser);
      expect(sourceRange2.getParser()).toBe(sourceRange1.getParser());
      expect(sourceRange2.start).toBe(sourceRange1.start);
      expect(sourceRange2.end).toBe(sourceRange1.end);
    });
  });

  describe("toString", function() {
    it("should be able to convert to a string", function() {
      var parser      = new Parser('testing 123'),
          sourceRange = new SourceRange(parser, 1, 6);

      expect(('' + sourceRange)).toBe('{1-6}[estin]');
    });
  });

  describe("getParser", function() {
    it("should be able to get parser", function() {
      var parser      = new Parser('testing 123'),
          sourceRange = new SourceRange(parser, 1, 6);

      expect(sourceRange.getParser()).toBe(parser);
    });
  });

  describe("value", function() {
    it("should be able to get range value from source", function() {
      var parser      = new Parser('testing 123'),
          sourceRange = new SourceRange(parser, 1, 6);

      expect(sourceRange.value).toBe('estin');

      sourceRange.start = 0;
      sourceRange.end = 7;

      expect(sourceRange.value).toBe('testing');
    });
  });
});
