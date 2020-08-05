const { Utils } = require('./lib');

describe("Utils", function() {
  describe("isValidNumber", function() {
    it("should be able to check number", function() {
      expect(Utils.isValidNumber(true)).toBe(false);
      expect(Utils.isValidNumber('456')).toBe(false);
      expect(Utils.isValidNumber(null)).toBe(false);
      expect(Utils.isValidNumber(undefined)).toBe(false);
      expect(Utils.isValidNumber(NaN)).toBe(false);
      expect(Utils.isValidNumber(Infinity)).toBe(false);
      expect(Utils.isValidNumber(-Infinity)).toBe(false);
      expect(Utils.isValidNumber(0)).toBe(true);
      expect(Utils.isValidNumber(-0)).toBe(true);
    });
  });

  describe("isType", function() {
    it("should be able to check boolean type", function() {
      expect(Utils.isType(0,                  'boolean')).toBe(false);
      expect(Utils.isType(BigInt(23),         'boolean')).toBe(false);
      expect(Utils.isType('',                 'boolean')).toBe(false);
      expect(Utils.isType([],                 'boolean')).toBe(false);
      expect(Utils.isType({},                 'boolean')).toBe(false);
      expect(Utils.isType(true,               'boolean')).toBe(true);
      expect(Utils.isType(new Boolean(true),  'boolean')).toBe(true);
    });

    it("should be able to check number type", function() {
      expect(Utils.isType(true,               'number')).toBe(false);
      expect(Utils.isType(BigInt(23),         'number')).toBe(false);
      expect(Utils.isType('',                 'number')).toBe(false);
      expect(Utils.isType([],                 'number')).toBe(false);
      expect(Utils.isType({},                 'number')).toBe(false);
      expect(Utils.isType(0,                  'number')).toBe(true);
      expect(Utils.isType(new Number(0),      'number')).toBe(true);
    });

    it("should be able to check BigInt type", function() {
      expect(Utils.isType(true,               'bigint')).toBe(false);
      expect(Utils.isType(0,                  'bigint')).toBe(false);
      expect(Utils.isType('',                 'bigint')).toBe(false);
      expect(Utils.isType([],                 'bigint')).toBe(false);
      expect(Utils.isType({},                 'bigint')).toBe(false);
      expect(Utils.isType(23n,                'bigint')).toBe(true);
      expect(Utils.isType(BigInt(23),         'bigint')).toBe(true);
    });

    it("should be able to check string type", function() {
      expect(Utils.isType(true,               'string')).toBe(false);
      expect(Utils.isType(0,                  'string')).toBe(false);
      expect(Utils.isType(BigInt(23),         'string')).toBe(false);
      expect(Utils.isType([],                 'string')).toBe(false);
      expect(Utils.isType({},                 'string')).toBe(false);
      expect(Utils.isType('',                 'string')).toBe(true);
      expect(Utils.isType(new String(''),     'string')).toBe(true);
    });

    it("should be able to check array type", function() {
      expect(Utils.isType(true,               'array')).toBe(false);
      expect(Utils.isType(0,                  'array')).toBe(false);
      expect(Utils.isType(BigInt(23),         'array')).toBe(false);
      expect(Utils.isType('',                 'array')).toBe(false);
      expect(Utils.isType({},                 'array')).toBe(false);
      expect(Utils.isType([],                 'array')).toBe(true);
      expect(Utils.isType(new Array(1),       'array')).toBe(true);
    });

    it("should be able to check object type", function() {
      class Test {};

      expect(Utils.isType(true,               'object')).toBe(false);
      expect(Utils.isType(0,                  'object')).toBe(false);
      expect(Utils.isType(BigInt(23),         'object')).toBe(false);
      expect(Utils.isType('',                 'object')).toBe(false);
      expect(Utils.isType([],                 'object')).toBe(false);
      expect(Utils.isType(new Test(),         'object')).toBe(false);
      expect(Utils.isType({},                 'object')).toBe(true);
      expect(Utils.isType(new Object({}),     'object')).toBe(true);
    });

    it("should be able to check function type", function() {
      class Test {};

      expect(Utils.isType(true,               'function')).toBe(false);
      expect(Utils.isType(0,                  'function')).toBe(false);
      expect(Utils.isType(BigInt(23),         'function')).toBe(false);
      expect(Utils.isType('',                 'function')).toBe(false);
      expect(Utils.isType([],                 'function')).toBe(false);
      expect(Utils.isType({},                 'function')).toBe(false);
      expect(Utils.isType(Test,               'function')).toBe(false);
      expect(Utils.isType(() => {},           'function')).toBe(true);
    });

    it("should be able to check class type", function() {
      class Test {};

      expect(Utils.isType(true,               'class')).toBe(false);
      expect(Utils.isType(0,                  'class')).toBe(false);
      expect(Utils.isType(BigInt(23),         'class')).toBe(false);
      expect(Utils.isType('',                 'class')).toBe(false);
      expect(Utils.isType([],                 'class')).toBe(false);
      expect(Utils.isType({},                 'class')).toBe(false);
      expect(Utils.isType(() => {},           'class')).toBe(false);
      expect(Utils.isType(Test,               'class')).toBe(true);
    });

    it("should be able to check RegExp type", function() {
      class Test {};

      expect(Utils.isType(true,               'RegExp')).toBe(false);
      expect(Utils.isType(0,                  'RegExp')).toBe(false);
      expect(Utils.isType(BigInt(23),         'RegExp')).toBe(false);
      expect(Utils.isType('',                 'RegExp')).toBe(false);
      expect(Utils.isType([],                 'RegExp')).toBe(false);
      expect(Utils.isType({},                 'RegExp')).toBe(false);
      expect(Utils.isType(() => {},           'RegExp')).toBe(false);
      expect(Utils.isType(Test,               'RegExp')).toBe(false);
      expect(Utils.isType(/test/,             'RegExp')).toBe(true);
      expect(Utils.isType(new RegExp('test'), 'RegExp')).toBe(true);
    });
  });

  describe("addRegExpFlags", function() {
    it("should be able to change flags of a RegExp", function() {
      const flagsMatch = (re, str) => {
        return (re.flags.split('').sort().join('') === str.split('').sort().join(''));
      };

      expect(Utils.addRegExpFlags('test', 'iiggmm') instanceof RegExp).toBe(true);
      expect(flagsMatch(Utils.addRegExpFlags('test', 'iiggmm'), 'igm')).toBe(true);
      expect(flagsMatch(Utils.addRegExpFlags(/test/i, 'g'), 'ig')).toBe(true);
      expect(flagsMatch(Utils.addRegExpFlags(/test/img), 'img')).toBe(true);
      expect(flagsMatch(Utils.addRegExpFlags(/test/, 'g'), 'g')).toBe(true);
    });
  });
});
