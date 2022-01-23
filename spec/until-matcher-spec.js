const { Parser, Token, GenericTokens } = require('./lib');
const { $UNTIL } = GenericTokens;

describe("$UNTIL", function() {
  describe("$UNTIL Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing \\"token\\" matching" some following value');
      var matcher = $UNTIL('"', '\\', 'String');
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing \\"token\\" matching');
      expect(result.value).toBe('testing "token" matching');
      expect(result.typeName).toBe('String');
    });

    it("should be able to match against input without escape char", function() {
      var parser  = new Parser('testing token matching" some following value');
      var matcher = $UNTIL('"', { typeName: 'String' });
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.value).toBe('testing token matching');
      expect(result.typeName).toBe('String');
    });
  });
});
