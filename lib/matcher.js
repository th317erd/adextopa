import * as Utils       from './utils.js';
import { TypeBase }     from './type-base.js';
import { SourceRange }  from './source-range.js';

export const Matcher = Utils.makeKeysNonEnumerable(class Matcher extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'Matcher';

  static isVirtualMatcher(value) {
    return (value && typeof value.isVirtual === 'function' && value.isVirtual() === true);
  }

  static isVirtual() {
    return false;
  }

  static isConsuming() {
    return true;
  }

  static hasOwnScope() {
    return false;
  }

  static skipLogging() {
    return true;
  }

  isVirtual() {
    return this.constructor.isVirtual();
  }

  isConsuming() {
    return this.constructor.isConsuming();
  }

  hasOwnScope() {
    return this.constructor.hasOwnScope();
  }

  skipLogging(...names) {
    return this.constructor.skipLogging(...names);
  }

  constructor(_options) {
    let options = _options || {};

    super(options);

    let name = options.name || null;

    Object.defineProperties(this, {
      'hasCustomName': {
        enumerable:   false,
        configurable: true,
        get:          () => !!name,
      },
      'name': {
        enumerable:   false,
        configurable: true,
        get:          () => name || this.constructor.name,
        set:          (_name) => {
          name = _name;
        },
      },
    });
  }

  clone(options) {
    return new this.constructor(
      Object.assign(
        Object.create(null),
        this.getOptions(),
        options || {},
      ),
    );
  }

  async exec(matcherScope) {
    return matcherScope.context.failResult();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON() {
    return {
      $type:          Utils.typeOf(this),
      name:           this.name,
      hasCustomName:  this.hasCustomName,
    };
  }

  createMatcherScope(context) {
    let startOffset   = context.parserRange.start;
    let endOffset     = context.parserRange.end;
    let parserRange   = new SourceRange(startOffset, endOffset);
    let matcherName   = ('' + context.resolvePrimitive(this.name));
    let typeName      = ('' + this.constructor.name);

    let matcherScope = {
      thisMatcher: this,
      context,
      matcherName,
      typeName,
      startOffset,
      endOffset,
      parserRange,
    };

    return matcherScope;
  }

  updateParserRange(matcherScope, newRange) {
    let {
      context,
    } = matcherScope;

    context.parserRange = newRange.clone();
    context.parserRange.clampTo(matcherScope.context.getInputRange());

    return context.parserRange;
  }

  updateParserOffset(matcherScope, matcherResult, offset) {
    let {
      context,
    } = matcherScope;

    context.parserRange.start = offset;
    context.parserRange.clampTo(matcherScope.context.getInputRange());

    return context.parserRange;
  }
});
