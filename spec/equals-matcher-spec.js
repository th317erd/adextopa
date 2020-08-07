const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $EQUALS } = GenericTokens;

describe("$EQUALS", function() {
  describe("$EQUALS Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $EQUALS('test');

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });
  });
});
