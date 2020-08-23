const { Parser, Token, GenericTokens } = require('./lib');
const { $SELECT, $LOOP, $PROGRAM, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$SELECT", function() {
  describe("$SELECT Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing 10 matching -22.45'),
          program = $SELECT(
                      $MATCHES(/[a-zA-Z]+/, 'Word'),
                      $MATCHES(/[\d.-]+/, 'Number'),
                      $MATCHES(/\s+/, 'WhiteSpace')
                    ),
          matcher = $LOOP(program);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing 10 matching -22.45');
      expect(result.length).toBe(7);
      expect(result.children[0]._raw).toBe('testing');
      expect(result.children[0].typeName).toBe('Word');
      expect(result.children[1]._raw).toBe(' ');
      expect(result.children[1].typeName).toBe('WhiteSpace');
      expect(result.children[2]._raw).toBe('10');
      expect(result.children[2].typeName).toBe('Number');
      expect(result.children[3]._raw).toBe(' ');
      expect(result.children[3].typeName).toBe('WhiteSpace');
      expect(result.children[4]._raw).toBe('matching');
      expect(result.children[4].typeName).toBe('Word');
      expect(result.children[5]._raw).toBe(' ');
      expect(result.children[5].typeName).toBe('WhiteSpace');
      expect(result.children[6]._raw).toBe('-22.45');
      expect(result.children[6].typeName).toBe('Number');
    });
  });
});
