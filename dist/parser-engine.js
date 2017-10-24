'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BODY = exports.AND = exports.OR = exports.NOT = exports.REPEAT = exports.ALIAS = exports.EQ = exports.REGEXP = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.isValidResult = isValidResult;
exports.convertToTokenParser = convertToTokenParser;
exports.coerceValueToToken = coerceValueToToken;
exports.createTokenParser = createTokenParser;
exports.loop = loop;

var _utils = require('./utils');

var _position = require('./position');

var _position2 = _interopRequireDefault(_position);

var _token = require('./token');

var _token2 = _interopRequireDefault(_token);

var _tokenStream = require('./token-stream');

var _tokenStream2 = _interopRequireDefault(_tokenStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//const MUST_BE_TOKEN_MESSAGE = 'Resolver must return a token. If you want to return "nothing" consider returning the NULL token';

function isValidResult(result) {
  if (!result || result instanceof Array && result.length === 0 || result.type === 'NULL' || result.success === false) return false;

  return true;
}

function convertToTokenParser(_getter) {
  var getter = _getter;
  if (getter instanceof RegExp) getter = REGEXP(getter);else if (typeof getter === 'string' || getter instanceof String) getter = EQ(getter);else if (!(getter instanceof Function)) {
    console.log('TYPE: ', getter);
    throw new Error('Parser getter type not supported. Supported types are: RegExp, String, and Function');
  }

  if (getter._rawParser === true) return getter();

  return getter;
}

function coerceValueToToken(value, pos) {
  if (value instanceof _token2.default) return value;

  if ((0, _utils.noe)(value)) return _token.NULL.call(this, pos);

  if (typeof value === 'string' || value instanceof String) return _token.STRING.call(this, value.valueOf(), pos);

  if (typeof value === 'number' || value instanceof Number) return _token.NUMBER.call(this, value.valueOf(), pos);

  if (typeof value === 'boolean' || value instanceof Boolean) return _token.BOOLEAN.call(this, value.valueOf(), pos);

  if (value instanceof Array) return _token.ARRAY.call(this, value, pos);

  if (value.toToken instanceof Function) return value.toToken(this, pos);

  throw new Error('Do not know how to convert value ' + value + ' to token');
}

function createTokenParser(_getter, _resolver, _convertParams) {
  var resolver = _resolver,
      getter = convertToTokenParser(_getter);

  if (arguments.length < 2) resolver = function resolver(r) {
    return r;
  };

  var creatorFunc = function creatorFunc() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var params = _convertParams instanceof Function ? _convertParams.call.apply(_convertParams, [this].concat(args)) : args;

    return function () {
      var _this = this;

      var handleFinalValue = function handleFinalValue(val) {
        //console.log('Got value!', (val instanceof Token) ? ('Token: ' + val.value) : val);
        var ret = coerceValueToToken.call(_this, val),
            pos = ret.position;

        if (ret.success) {
          //console.log('Seeking to: ', pos.start, pos.end);
          _this.seek(pos.end);
        }

        return ret;
      };

      // We have hit the end of stream... don't call any more parsers
      if (this.eof()) return handleFinalValue();

      var startPos = this.offset,
          context = new _tokenStream2.default(this),
          value = getter.call.apply(getter, [context].concat(_toConsumableArray(params)));

      if (value instanceof Promise) {
        return function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_val) {
            var _resolver2;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.t0 = handleFinalValue;
                    _context.t1 = (_resolver2 = resolver).call;
                    _context.t2 = _resolver2;
                    _context.t3 = _this;
                    _context.next = 6;
                    return _val;

                  case 6:
                    _context.t4 = _context.sent;
                    _context.t5 = _toConsumableArray(params);
                    _context.t6 = [_context.t3, _context.t4].concat(_context.t5);
                    _context.t7 = _context.t1.apply.call(_context.t1, _context.t2, _context.t6);
                    return _context.abrupt('return', (0, _context.t0)(_context.t7));

                  case 11:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }()(value);
      } else {
        var _resolver3;

        value = (_resolver3 = resolver).call.apply(_resolver3, [this, value].concat(_toConsumableArray(params)));
        if (value instanceof Promise) return value;

        return handleFinalValue(value);
      }
    };
  };

  Object.defineProperty(creatorFunc, '_rawParser', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: true
  });

  return creatorFunc;
}

function loop(cb) {
  var loopAsync = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return val;

            case 2:
              val = _context2.sent;

              if (val !== d) values.push(val);

              i++;

            case 5:
              if (done) {
                _context2.next = 13;
                break;
              }

              _context2.next = 8;
              return cb.call(this, i, d, values[values.length - 1], values);

            case 8:
              val = _context2.sent;

              if (val !== d) values.push(val);

            case 10:
              i++;
              _context2.next = 5;
              break;

            case 13:
              return _context2.abrupt('return', doneValue);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function loopAsync() {
      return _ref2.apply(this, arguments);
    };
  }();

  var done = false,
      doneValue,
      d = function d(_val) {
    done = true;doneValue = arguments.length ? _val : values;return d;
  },
      values = [],
      val;

  for (var i = 0; !done; i++) {
    val = cb.call(this, i, d, values[values.length - 1], values);

    if (val instanceof Promise) return loopAsync.call(this);

    if (val !== d) values.push(val);
  }

  return doneValue;
}

/* --- DEFAULT TOKENS --- */

var REGEXP = exports.REGEXP = createTokenParser(function (regexp) {
  var startPos = this.offset;

  regexp.lastIndex = startPos;

  var str = this.toString(),
      match = regexp.exec(str);

  //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
  return match && match.index === startPos ? match : undefined;
}, function (_result, regexp, resolver) {
  var result = _result;
  if (resolver instanceof Function) {
    result = resolver.call(this, result);
  } else {
    if (!isValidResult(result)) return;

    result = result[0];
  }

  if (!isValidResult(result)) return;

  if (result instanceof _token2.default) return result;

  return new _token2.default({
    type: 'REGEXP',
    source: this,
    position: ('' + result).length,
    value: result,
    rawValue: _result,
    success: true
  });
}, function (_regexp, resolver) {
  function getFlags(flags) {
    var finalFlags = [];
    for (var i = 0, il = flags.length; i < il; i++) {
      var flag = flags.charAt(i);
      if (finalFlags.indexOf(flag) < 0) finalFlags.push(flag);
    }

    if (finalFlags.indexOf('g') < 0) finalFlags.push('g');

    return finalFlags;
  }

  var regexp = _regexp instanceof String || typeof _regexp === 'string' ? new RegExp(_regexp, 'g') : _regexp,
      reSource = regexp.source,
      reFlags = getFlags(regexp.flags);

  return [new RegExp(reSource, reFlags), resolver];
});

var EQ = exports.EQ = createTokenParser(function (str) {
  var chunk = this.substr(this.offset, str.length),
      m = chunk === str;
  return { value: m ? str : chunk, success: m };
}, function (_result, str, resolver) {
  var result = resolver instanceof Function ? resolver.call(this, _result) : _result;

  if (result instanceof _token2.default) return result;

  return new _token2.default({
    type: 'EQ',
    source: this,
    position: result.value.length,
    value: result.value,
    rawValue: _result,
    success: result.success
  });
});

var ALIAS = exports.ALIAS = createTokenParser(function (parser, name) {
  return convertToTokenParser(parser).call(this);
}, function (token, parser, name) {
  if (!token) return;

  return new _token2.default(_extends({}, token, {
    type: name,
    source: token.source,
    position: token.position,
    value: token.value,
    success: token.success
  }));
});

var REPEAT = exports.REPEAT = createTokenParser(function (_getter, _min, _max) {
  var _this2 = this;

  var getter = convertToTokenParser(_getter),
      min = _min === undefined ? 0 : _min,
      max = _max === undefined ? Infinity : _max;

  if (arguments.length === 2) max = min;

  return loop.call(this, function (index, done, previousValue, values) {
    if (index > 0 && !isValidResult(previousValue)) {
      if (index - 1 >= min) return done(values.slice(0, -1));

      return done(null);
    }

    //console.log('LOOPING!!', index);
    if (index >= max) return done();

    return getter.call(_this2);
  });
}, function (result) {
  if (!isValidResult(result)) return;

  return new _token2.default({
    type: 'REPEAT',
    source: this,
    position: result[result.length - 1].position,
    value: result.map(function (t) {
      return t.value;
    }).join(''),
    rawValue: result
  });
});

var NOT = exports.NOT = createTokenParser(function (_parser) {
  var parser = convertToTokenParser(_parser);
  return parser.call(this);
}, function (result) {
  if (!result || result.success === true) return;

  return new _token2.default({
    type: 'NOT',
    source: result.source,
    position: result.position,
    value: result.value,
    rawValue: result.rawValue,
    success: true
  });
});

var OR = exports.OR = createTokenParser(function () {
  var _this3 = this;

  for (var _len2 = arguments.length, parsers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    parsers[_key2] = arguments[_key2];
  }

  return loop.call(this, function (index, done, previousValue) {
    if (index > 0 && isValidResult(previousValue)) return done(previousValue);

    if (index >= parsers.length) return done(null);

    return convertToTokenParser(parsers[index]).call(_this3);
  });
});

var AND = exports.AND = createTokenParser(function () {
  var _this4 = this;

  for (var _len3 = arguments.length, parsers = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    parsers[_key3] = arguments[_key3];
  }

  var results = [];

  return loop.call(this, function (index, done, previousValue, values) {
    if (index > 0 && !isValidResult(previousValue)) return done(null);

    if (index >= parsers.length) return done();

    return convertToTokenParser(parsers[index]).call(_this4);
  });
}, function (result) {
  if (!isValidResult(result)) return;

  return new _token2.default({
    type: 'AND',
    source: this,
    position: result[result.length - 1].position,
    value: result.map(function (t) {
      return t.value;
    }).join(''),
    rawValue: result
  });
});

var BODY = exports.BODY = createTokenParser(function (boundaryChar, name) {
  if (!boundaryChar || boundaryChar.length !== 1) throw new Error('Boundary character must be exactly one character');

  if (this.eof()) return;

  var startPos = this.offset,
      c = this.get();

  if (c !== boundaryChar) return;

  while (!this.eof()) {
    var c = this.get();
    if (c === '\\') {
      this.get();
      continue;
    }

    if (c === boundaryChar) break;
  }

  if (c !== boundaryChar) this.raise('Unexpected end of input');

  return this.get(new _position2.default(startPos, this.offset)).toString();
}, function (result, c, name) {
  if (!isValidResult(result)) return;

  return new _token2.default({
    type: name || 'BODY',
    source: this,
    position: result.length,
    value: result.substring(1, result.length - 1),
    rawValue: result,
    success: true
  });
});