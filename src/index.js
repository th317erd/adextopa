const Utils           = require('./utils');
const SourceRange     = require('./source-range');
const Token           = require('./token');
const Parser          = require('./parser');
const GenericTokens   = require('./generic-tokens');

module.exports = Object.assign({
  Utils,
  GenericTokens
}, SourceRange, Token, Parser);
