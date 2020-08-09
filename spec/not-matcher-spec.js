const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $NOT, $LOOP, $PROGRAM, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$NOT", function() {
  describe("$NOT Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('word'),
          matcher1 = $NOT($MATCHES(/\w+/)),
          matcher2 = $NOT($MATCHES(/\W+/));

      expect(matcher1 instanceof MatcherDefinition).toBe(true);
      expect(matcher2 instanceof MatcherDefinition).toBe(true);

      var result = matcher1.exec(parser);
      expect(result).toBe(false);

      result = matcher2.exec(parser);
      expect(result).toBe(undefined);
    });

    it("should be able to match against input", function() {
      var parser  = new Parser('"this is a \\"string\\", can you believe it?"'),
          quote   = $MATCHES(/"/, 'Quote'),
          program = $PROGRAM(
                      quote,
                      $LOOP(
                        $PROGRAM(
                          $OPTIONAL($MATCHES(/\\(.)/)),
                          $NOT(quote),
                          $MATCHES(/(.)/)
                        )
                      ),
                      quote
                    );

      expect(program instanceof MatcherDefinition).toBe(true);

      var result = program.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('"this is a \\"string\\", can you believe it?"');
      expect(result.length).toBe(3);
      expect(result.children[0]._raw).toBe('"');
      expect(result.children[1].length).toBe(37);
      expect(result.children[1]._raw).toBe('this is a \\"string\\", can you believe it?');
      expect(result.children[2]._raw).toBe('"');
    });
  });
});
