const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $PROGRAM, $LOOP, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$PROGRAM", function() {
  describe("$PROGRAM Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('KEY1 =VALUE1;key2 = value2;'),
          $WS     = $OPTIONAL($MATCHES(/\s+/)),
          $KV     = $PROGRAM($MATCHES(/\w+/, { typeName: 'Key'}), $WS, $MATCHES(/=/, { typeName: 'Operator' }), $WS, $MATCHES(/[^;]*/), ({ token }) => {
            return token.clone({

            });
          }),
          $L      = $LOOP($PROGRAM());

      expect($KV instanceof MatcherDefinition).toBe(true);
      expect($L instanceof MatcherDefinition).toBe(true);

      var result1 = $KV.exec(parser);
      expect(result1 instanceof Token).toBe(true);
      expect(result1._raw).toBe('KEY1 =VALUE1');
      expect(result1.length).toBe(4);
    });
  });
});
