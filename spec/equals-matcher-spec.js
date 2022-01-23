const { Parser, Token, GenericTokens } = require('./lib');
const { $EQUALS } = GenericTokens;

describe("$EQUALS", function() {
  describe("$EQUALS Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching');
      var matcher = $EQUALS('test');
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });
  });
});
