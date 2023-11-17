import * as Utils       from './utils.js';
import { TypeBase }     from './type-base.js';
import { SourceRange }  from './source-range.js';

export const Matcher = Utils.makeKeysNonEnumerable(class Matcher extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'Matcher';

  static isVirtualMatcher(value) {
    return (value && typeof value.isVirtual === 'function' && value.isVirtual() === true);
  }

  static isVirtual() {
    return Object.prototype.hasOwnProperty.call(this, Utils.VIRTUAL_RESOLVER);
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
    let matcherName   = ('' + context.resolveValue(this.name));
    let typeName      = ('' + this.constructor.name);
    let startOffset   = context.parserRange.start;
    let endOffset     = context.parserRange.end;
    let matcherRange  = new SourceRange(startOffset, endOffset);
    let parserRange   = context.getInputRange();

    let matcherScope = {
      thisMatcher: this,
      context,
      typeName,
      matcherName,
      startOffset,
      endOffset,
      matcherRange,
      parserRange,
    };

    return matcherScope;
  }
});
