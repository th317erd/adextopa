const { Parser, Token, GenericTokens } = require('./lib');
const { $MATCHES } = GenericTokens;

describe("$MATCHES", function() {
  describe("$MATCHES Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $MATCHES(/test/);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
    });

    it("should be able to match against input and capture", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $MATCHES(/test(\w+)/);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing');
      expect(result[1]).toBe('ing');
    });
  });
});
