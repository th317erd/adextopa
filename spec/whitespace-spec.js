const { Parser, Token, SkipToken, GenericTokens } = require('./lib');
const { $WS } = GenericTokens;

describe("$WS", function() {
  describe("$WS Matcher", function() {
    it("should be able to match against input", function() {
      var parser  = new Parser(' \t\n\t \n');
      var matcher = $WS();
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe(' \t\n\t \n');
    });

    it("should be able to stop on new lines", function() {
      var parser  = new Parser(' \t\n\t \n');
      var matcher = $WS({ newLines: false });
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe(' \t');
    });

    it("should be able to specify a minimum match", function() {
      var parser  = new Parser('      ');
      var matcher = $WS({ min: 6 });
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('      ');

      parser = new Parser('   ');
      result = matcher.exec(parser);

      expect(result).toBe(false);
    });

    it("should be able to specify a maximum match", function() {
      var parser  = new Parser('      ');
      var matcher = $WS({ max: 3 });
      var result  = matcher.exec(parser);

      expect(result instanceof Token).toBe(true);
      expect(result._raw).toBe('   ');
    });

    it("should be able to discard match", function() {
      var parser  = new Parser('      ');
      var matcher = $WS({ discard: true });
      var result  = matcher.exec(parser);

      expect(result instanceof SkipToken).toBe(true);
      expect(result._raw).toBe('      ');
    });
  });
});
