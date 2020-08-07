const { Parser, Token, MatcherDefinition, GenericTokens } = require('./lib');
const { $LOOP, $PROGRAM, $OPTIONAL, $MATCHES } = GenericTokens;

describe("$LOOP", function() {
  describe("$LOOP Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $LOOP(
            $PROGRAM(
              $MATCHES(/\w+/),
              $OPTIONAL($MATCHES(/\s+/))
            )
          );

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(3);
      expect(result.children[0]._raw).toBe('testing ');
      expect(result.children[1]._raw).toBe('token ');
      expect(result.children[2]._raw).toBe('matching');
    });

    it("should be able to accept options", function() {
      var parser  = new Parser('testing token matching'),
          matcher = $LOOP(
            $PROGRAM(
              $MATCHES(/\w+/),
              $OPTIONAL($MATCHES(/\s+/)),
              { typeName: 'TestProgram' }
            ),
            { typeName: 'TestLoop' }
          );

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(3);
      expect(result.children[0].typeName).toBe('TestProgram');
      expect(result.children[1].typeName).toBe('TestProgram');
      expect(result.children[2].typeName).toBe('TestProgram');
    });

    it("should be able to work with min", function() {
      var parser    = new Parser('a b c d e f g h i j k l m n o p q r s t u v w x y z'),
          program   = $PROGRAM($MATCHES(/\w+/), $OPTIONAL($MATCHES(/\s+/))),
          matcher1  = $LOOP(program, { typeName: 'TestType', min: 45 }),
          matcher2  = $LOOP(program, { typeName: 'TestType', min: 5 });

      expect(matcher1 instanceof MatcherDefinition).toBe(true);
      expect(matcher2 instanceof MatcherDefinition).toBe(true);

      var result1 = matcher1.exec(parser),
          result2 = matcher2.exec(parser);

      expect(result1).toBe(false);
      expect(result2 instanceof Token).toBe(true);
      expect(result2.length).toBe(26);
    });

    it("should be able to work with max", function() {
      var parser  = new Parser('a b c d e f g h i j k l m n o p q r s t u v w x y z'),
          program = $PROGRAM($MATCHES(/\w+/), $OPTIONAL($MATCHES(/\s+/))),
          matcher = $LOOP(program, { typeName: 'TestType', max: 8 });

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result.length).toBe(8);
    });

    it("should be able to use a finalizer callback", function() {
      var parser  = new Parser('testing token matching'),
          program = $PROGRAM($MATCHES(/\w+/, 'Word'), $OPTIONAL($MATCHES(/\s+/, 'WhiteSpace'))),
          matcher = $LOOP(program, ({ token }) => {
            return token.clone({
              typeName: 'Words',
              words: token.children.map((token) => token.children[0]._raw),
              token
            });
          });

      expect(matcher instanceof MatcherDefinition).toBe(true);

      var result = matcher.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(3);
      expect(result.typeName).toBe('Words');
      expect(result.words.length).toBe(3);
      expect(result.words[0]).toBe('testing');
      expect(result.words[1]).toBe('token');
      expect(result.words[2]).toBe('matching');
      expect(result.children[0] instanceof Token).toBe(true);
      expect(result.children[0].parent).toBe(result);
      expect(result.children[1] instanceof Token).toBe(true);
      expect(result.children[1].parent).toBe(result);
      expect(result.children[2] instanceof Token).toBe(true);
      expect(result.children[2].parent).toBe(result);
      expect(result.children[3] instanceof Token).toBe(false);
    });
  });
});
