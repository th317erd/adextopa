const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $SEQUENCE } = GenericTokens;

describe("$SEQUENCE", function() {
  describe("$SEQUENCE Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing \\"token\\" matching" some following value'),
          matcher = $SEQUENCE('"', '\\', 'String');

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing \\"token\\" matching');
      expect(result.value).toBe('testing "token" matching');
      expect(result.typeName).toBe('String');
    });

    it("should be able to match against input without escape char", function() {
      var parser  = new Parser('testing token matching" some following value'),
          matcher = $SEQUENCE('"', { typeName: 'String' });

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.value).toBe('testing token matching');
      expect(result.typeName).toBe('String');
    });
  });
});
