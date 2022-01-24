const { Parser, Token, SkipToken, GenericTokens } = require('./lib');
const { $ANY } = GenericTokens;

describe("$ANY", function() {
  describe("$ANY Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser(' \t\n\t \n');
      var matcher = $ANY({ chars: ' \t\n\r' });
      var result  = parser.tokenize(matcher);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe(' \t\n\t \n');
    });

    it("should be able to build ranges", function() {
      var parser  = new Parser('somebody was here');
      var matcher = $ANY({ chars: 'a-z ' });
      var result  = parser.tokenize(matcher);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('somebody was here');

      parser  = new Parser('SOMEBODY WAS HERE');
      result  = parser.tokenize(matcher);;

      expect(result).toBe(false);

      parser  = new Parser('somebody-was-here');
      matcher = $ANY({ chars: 'a-z-' });
      result  = parser.tokenize(matcher);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('somebody-was-here');
    });

    it("should be able to specify a minimum match", function() {
      var parser  = new Parser('somebody was here');
      var matcher = $ANY({ chars: 'a-z ', min: 6 });
      var result  = parser.tokenize(matcher);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('somebody was here');

      parser = new Parser('som');
      result = parser.tokenize(matcher);

      expect(result).toBe(false);
    });

    it("should be able to specify a maximum match", function() {
      var parser  = new Parser('somebody was here');
      var matcher = $ANY({ chars: 'a-z ', max: 3 });
      var result  = parser.tokenize(matcher);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('som');
    });

    it("should be able to discard match", function() {
      var parser  = new Parser('      ');
      var matcher = $ANY({ chars: ' ', discard: true });
      var result  = matcher.exec(parser);

      expect(result instanceof SkipToken).toBe(true);
      expect(result._raw).toBe('      ');
    });
  });
});
