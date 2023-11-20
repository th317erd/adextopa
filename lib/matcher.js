import * as Utils       from './utils.js';
import { SourceRange }  from './source-range.js';
import { Attributable } from './attributable.js';

export const Matcher = Utils.makeKeysNonEnumerable(class Matcher extends Attributable {
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

  isVirtual() {
    return this.constructor.isVirtual();
  }

  isConsuming() {
    return this.constructor.isConsuming();
  }

  hasOwnScope() {
    return this.constructor.hasOwnScope();
  }

  async exec(matcherScope) {
    return matcherScope.context.failResult();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  createMatcherScope(context) {
    let matcherName   = ('' + context.resolveValue(this.getName()));
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
