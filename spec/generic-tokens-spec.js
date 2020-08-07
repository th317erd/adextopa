const { Parser, Source, SourceRange, Token, TokenDefinition, GenericTokens } = require('./lib');
const {
  $MATCHES,
  $EQUALS,
  $OPTIONAL,
  $LOOP
} = GenericTokens;

describe("Parser", function() {
  describe("$MATCHES", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          token   = $MATCHES(/test/);

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
    });

    it("should be able to match against input and capture", function() {
      var parser  = new Parser('testing token matching'),
          token   = $MATCHES(/test(\w+)/);

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing');
      expect(result[1]).toBe('ing');
    });
  });

  describe("$EQUALS", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          token   = $EQUALS('test');

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });
  });

  describe("$OPTIONAL", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          token   = $OPTIONAL($EQUALS('test'));

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('test');
      expect(result.value).toBe('test');
    });

    it("should be able to match against input (optionally)", function() {
      var parser  = new Parser('testing token matching'),
          token   = $OPTIONAL($EQUALS('something else'));

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result).toBe(undefined);
    });
  });

  describe("$LOOP", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser('testing token matching'),
          token   = $LOOP($MATCHES(/\w+/), $OPTIONAL($MATCHES(/\s+/)));

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(5);
    });

    it("should be able to accept options", function() {
      var parser  = new Parser('testing token matching'),
          token   = $LOOP($MATCHES(/\w+/), $OPTIONAL($MATCHES(/\s+/)), { typeName: 'TestType' });

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(5);
      expect(result.typeName).toBe('TestType');
    });

    it("should be able to use a finalizer callback", function() {
      var parser  = new Parser('testing token matching'),
          token   = $LOOP($MATCHES(/\w+/, 'Word'), $OPTIONAL($MATCHES(/\s+/, 'WhiteSpace')), ({ token }) => {
            return token.clone({
              typeName: 'Words',
              words: token.children.filter((token) => (token.typeName === 'Word')).map((token) => token._raw),
              token
            });
          });

      expect(token instanceof TokenDefinition).toBe(true);

      var result = token.exec(parser);
      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('testing token matching');
      expect(result.length).toBe(5);
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
      expect(result.children[3] instanceof Token).toBe(true);
      expect(result.children[3].parent).toBe(result);
      expect(result.children[4] instanceof Token).toBe(true);
      expect(result.children[4].parent).toBe(result);
      expect(result.children[5] instanceof Token).toBe(false);
    });
  });
});
