'use strict';

var _position = require('./position');

var _position2 = _interopRequireDefault(_position);

var _tokenStream = require('./token-stream');

var _tokenStream2 = _interopRequireDefault(_tokenStream);

var _parserEngine = require('./parser-engine');

var parserEngine = _interopRequireWildcard(_parserEngine);

var _tokenizer = require('./tokenizer');

var _tokenizer2 = _interopRequireDefault(_tokenizer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = Object.assign(module.exports, parserEngine, {
  Position: _position2.default,
  Token: _position2.default,
  TokenStream: _tokenStream2.default,
  Tokenizer: _tokenizer2.default
});