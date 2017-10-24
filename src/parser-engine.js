import { noe } from './utils';
import Position from './position';
import Token, { NULL, STRING, NUMBER, BOOLEAN, ARRAY } from './token';
import TokenStream from './token-stream';

//const MUST_BE_TOKEN_MESSAGE = 'Resolver must return a token. If you want to return "nothing" consider returning the NULL token';

export function isValidResult(result) {
  if (!result || (result instanceof Array && result.length === 0) || result.type === 'NULL' || result.success === false)
    return false;
  
  return true;
}

export function convertToTokenParser(_getter) {
  var getter = _getter;
  if (getter instanceof RegExp)
    getter = REGEXP(getter);
  else if (typeof getter === 'string' || getter instanceof String)
    getter = EQ(getter);
  else if (!(getter instanceof Function)) {
    console.log('TYPE: ', getter);
    throw new Error('Parser getter type not supported. Supported types are: RegExp, String, and Function');
  }

  if (getter._rawParser === true)
    return getter();

  return getter;
}

export function coerceValueToToken(value, pos) {
  if (value instanceof Token)
    return value;

  if (noe(value))
    return NULL.call(this, pos);
  
  if (typeof value === 'string' || value instanceof String)
    return STRING.call(this, value.valueOf(), pos);

  if (typeof value === 'number' || value instanceof Number)
    return NUMBER.call(this, value.valueOf(), pos);

  if (typeof value === 'boolean' || value instanceof Boolean)
    return BOOLEAN.call(this, value.valueOf(), pos);

  if (value instanceof Array)
    return ARRAY.call(this, value, pos);
  
  if (value.toToken instanceof Function)
    return value.toToken(this, pos);

  throw new Error('Do not know how to convert value ' + value + ' to token');
}

export function createTokenParser(_getter, _resolver, _convertParams) {
  var resolver = _resolver,
      getter = convertToTokenParser(_getter);

  if (arguments.length < 2)
    resolver = (r) => r;
  
  var creatorFunc = function(...args) {
    var params = (_convertParams instanceof Function) ? _convertParams.call(this, ...args) : args;

    return function() {
      const handleFinalValue = (val) => {
            //console.log('Got value!', (val instanceof Token) ? ('Token: ' + val.value) : val);
            var ret = coerceValueToToken.call(this, val),
                pos = ret.position;

            if (ret.success) {
              //console.log('Seeking to: ', pos.start, pos.end);
              this.seek(pos.end);
            }
          
            return ret;
          };

      // We have hit the end of stream... don't call any more parsers
      if (this.eof())
        return handleFinalValue();

      var startPos = this.offset,
          context = new TokenStream(this),
          value = getter.call(context, ...params);
          
      if (value instanceof Promise) {
        return (async (_val) => {
          return handleFinalValue(resolver.call(this, await _val, ...params));
        })(value);
      } else {
        value = resolver.call(this, value, ...params);
        if (value instanceof Promise)
          return value;
        
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

export function loop(cb) {
  async function loopAsync() {
    val = await val;
    if (val !== d)
      values.push(val);

    for (i++; !done; i++) {
      val = await cb.call(this, i, d, values[values.length - 1], values);
      if (val !== d)
        values.push(val);
    }

    return doneValue;
  }

  var done = false,
      doneValue,
      d = function(_val) { done = true; doneValue = (arguments.length) ? _val : values; return d; },
      values = [],
      val;

  for (var i = 0; !done; i++) {
    val = cb.call(this, i, d, values[values.length - 1], values);

    if (val instanceof Promise)
      return loopAsync.call(this);

    if (val !== d)
      values.push(val);
  }

  return doneValue;
}

/* --- DEFAULT TOKENS --- */

export const REGEXP = createTokenParser(function(regexp) {
  var startPos = this.offset;

  regexp.lastIndex = startPos;

  var str = this.toString(),
      match = regexp.exec(str);

  //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
  return (match && match.index === startPos) ? match : undefined;
}, function(_result, regexp, resolver) {
  var result = _result;
  if (resolver instanceof Function) {
    result = resolver.call(this, result);
  } else {
    if (!isValidResult(result))
      return;

    result = result[0];
  }

  if (!isValidResult(result))
    return;

  if (result instanceof Token)
    return result;

  return new Token({
    type: 'REGEXP',
    source: this,
    position: ('' + result).length,
    value: result,
    rawValue: _result,
    success: true
  });
}, function(_regexp, resolver) {
  function getFlags(flags) {
    var finalFlags = [];
    for (var i = 0, il = flags.length; i < il; i++) {
      var flag = flags.charAt(i);
      if (finalFlags.indexOf(flag) < 0)
        finalFlags.push(flag);
    }

    if (finalFlags.indexOf('g') < 0)
      finalFlags.push('g');

    return finalFlags;
  }

  var regexp = (_regexp instanceof String || typeof _regexp === 'string') ? new RegExp(_regexp, 'g') : _regexp,
      reSource = regexp.source,
      reFlags = getFlags(regexp.flags);

  return [new RegExp(reSource, reFlags), resolver];
});

export const EQ = createTokenParser(function(str) {
  var chunk = this.substr(this.offset, str.length),
      m = (chunk === str);
  return { value: (m) ? str : chunk, success: m };
}, function(_result, str, resolver) {
  var result = (resolver instanceof Function) ? resolver.call(this, _result) : _result;

  if (result instanceof Token)
    return result;

  return new Token({
    type: 'EQ',
    source: this,
    position: result.value.length,
    value: result.value,
    rawValue: _result,
    success: result.success
  });
});

export const ALIAS = createTokenParser(function(parser, name) {
  return convertToTokenParser(parser).call(this);
}, function(token, parser, name) {
  if (!token)
    return;

  return new Token({
    ...token,
    type: name,
    source: token.source,
    position: token.position,
    value: token.value,
    success: token.success
  });
});

export const REPEAT = createTokenParser(function(_getter, _min, _max) {
  var getter = convertToTokenParser(_getter),
      min = (_min === undefined) ? 0 : _min,
      max = (_max === undefined) ? Infinity : _max;

  if (arguments.length === 2)
    max = min;

  return loop.call(this, (index, done, previousValue, values) => {
    if (index > 0 && !isValidResult(previousValue)) {
      if ((index - 1) >= min)
        return done(values.slice(0, -1));

      return done(null);
    }

    //console.log('LOOPING!!', index);
    if (index >= max)
      return done();

    return getter.call(this);
  });
}, function(result) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: 'REPEAT',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

export const NOT = createTokenParser(function(_parser) {
  var parser = convertToTokenParser(_parser);
  return parser.call(this);
}, function(result) {
  if (!result || result.success === true)
    return;

  return new Token({
    type: 'NOT',
    source: result.source,
    position: result.position,
    value: result.value,
    rawValue: result.rawValue,
    success: true
  });
});

export const OR = createTokenParser(function(...parsers) {
  return loop.call(this, (index, done, previousValue) => {
    if (index > 0 && isValidResult(previousValue))
      return done(previousValue);

    if (index >= parsers.length)
      return done(null);

    return convertToTokenParser(parsers[index]).call(this);
  });
});

export const AND = createTokenParser(function(...parsers) {
  var results = [];

  return loop.call(this, (index, done, previousValue, values) => {
    if (index > 0 && !isValidResult(previousValue))
      return done(null);

    if (index >= parsers.length)
      return done();

    return convertToTokenParser(parsers[index]).call(this);
  });
}, function(result) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: 'AND',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

export const BLOCK = createTokenParser(function(boundaryChar, name) {
  if (!boundaryChar || boundaryChar.length !== 1)
    throw new Error('Boundary character must be exactly one character');

  if (this.eof())
    return;

  var startPos = this.offset,
      c = this.get();

  if (c !== boundaryChar)
    return;

  while (!this.eof()) {
    var c = this.get();
    if (c === '\\') {
      this.get();
      continue;
    }

    if (c === boundaryChar)
      break;
  }
  
  if (c !== boundaryChar)
    this.raise('Unexpected end of input');

  return this.get(new Position(startPos, this.offset)).toString();
}, function(result, c, name) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: name || 'BLOCK',
    source: this,
    position: result.length,
    value: result.substring(1, result.length - 1),
    rawValue: result,
    success: true
  });
});
