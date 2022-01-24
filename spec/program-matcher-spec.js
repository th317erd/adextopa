const { Parser, Token, GenericTokens } = require('./lib');
const { $EQUALS } = require('../src/generic-tokens/equals');
const { $PROGRAM, $LOOP, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$PROGRAM", function() {
  describe("$PROGRAM Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('KEY1 =VALUE1;key2 = value2;');
      var $WS     = $OPTIONAL($MATCHES(/\s+/));
      var $KV     = $PROGRAM(
        $MATCHES(
          /\w+/,
          { typeName: 'Key'}
        ),
        $WS,
        $MATCHES(/=/, { typeName: 'Operator' }),
        $WS,
        $MATCHES(/[^;]*/),
        ({ token }) => token.clone({}),
      );
      var $L      = $LOOP($PROGRAM());
      var result1 = $KV.exec(parser);

      expect(result1 instanceof Token).toBe(true);
      expect(result1._raw).toBe('KEY1 =VALUE1');
      expect(result1.children.length).toBe(4);
    });

    it("should be able to match against input, stopping on first match", function() {
      var parser  = new Parser('one two three');
      var program = $PROGRAM(
        $MATCHES(/\w+/),
        $MATCHES(/\s+/),
        $MATCHES(/\w+/),
        $MATCHES(/\s+/),
        $MATCHES(/\w+/),
        { stopOnFirstMatch: true },
      );

      var result1 = program.exec(parser);

      expect(result1 instanceof Token).toBe(true);
      expect(result1._raw).toBe('one');
      expect(result1.children.length).toBe(1);
      expect(result1.children[0]._raw).toBe('one');
    });
  });
});
