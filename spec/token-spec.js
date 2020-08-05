const { Parser, Source, SourceRange, Token } = require('./lib');

describe("Parser", function() {
  describe("clone", function() {
    it("should be able to clone", function() {
    });
  });

  describe("constructor", function() {
    it("should be able to create a token with custom properties", function() {
      var token = new Token(null, null, { hello: 'world', test: true });
      expect(token.hello).toBe('world');
      expect(token.test).toBe(true);
    });
  });
});
