const { Parser, Token, GenericTokens } = require('./lib');
const { $OPTIONAL, $EQUALS } = GenericTokens;

describe("$OPTIONAL", function() {
  describe("$OPTIONAL Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching');
      var matcher = $OPTIONAL($EQUALS('test'));
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });

    it("should be able to match against input (optionally)", function() {
      var parser  = new Parser('testing token matching');
      var matcher = $OPTIONAL($EQUALS('something else'));
      var result  = matcher.exec(parser);

      expect(result).toBe(undefined);
    });
  });
});
