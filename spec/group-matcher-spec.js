const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $GROUP, $MATCHES } = GenericTokens;

describe("$GROUP", function() {
  describe("$GROUP Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('"testing \\"token\\" matching"'),
          quote   = $MATCHES(/"/),
          matcher = $GROUP(quote, quote, $MATCHES(/\\(.)/));

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('"testing \\"token\\" matching"');
      expect(result.start._raw).toBe('"');
      expect(result.end._raw).toBe('"');
      expect(result.body.value).toBe('testing "token" matching');
      expect(result.body._raw).toBe('testing \\"token\\" matching');
    });
  });
});
