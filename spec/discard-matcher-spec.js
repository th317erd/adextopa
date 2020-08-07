const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $DISCARD, $LOOP, $PROGRAM, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$DISCARD", function() {
  describe("$DISCARD Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          program = $PROGRAM(
                      $MATCHES(/\w+/, 'Word'),
                      $DISCARD(
                        $OPTIONAL($MATCHES(/\s+/))
                      )
                    ),
          matcher = $LOOP(program);

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(3);
      expect(result.children[0].length).toBe(1);
      expect(result.children[0].children[0]._raw).toBe('testing');
      expect(result.children[1].length).toBe(1);
      expect(result.children[1].children[0]._raw).toBe('token');
      expect(result.children[2].length).toBe(1);
      expect(result.children[2].children[0]._raw).toBe('matching');
    });
  });
});
