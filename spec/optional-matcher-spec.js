const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $OPTIONAL, $EQUALS } = GenericTokens;

describe("$OPTIONAL", function() {
  describe("$OPTIONAL Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $OPTIONAL($EQUALS('test'));

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });

    it("should be able to match against input (optionally)", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $OPTIONAL($EQUALS('something else'));

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result).toBe(undefined);
    });
  });
});
