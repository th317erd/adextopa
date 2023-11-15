import * as Utils   from '../utils.js';
import { TypeBase } from '../type-base.js';

const STATUS_FAILED   = Symbol.for('/adextopa/status/failed');
const STATUS_SUCCESS  = Symbol.for('/adextopa/status/success');
const STATUS_STOP     = Symbol.for('/adextopa/status/stop');
const ALL_STATUSES    = [ STATUS_FAILED, STATUS_SUCCESS, STATUS_STOP ];

export const MatcherResult = Utils.makeKeysNonEnumerable(class MatcherResult extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'MatcherResult';

  static STATUS_FAILED  = STATUS_FAILED;
  static STATUS_SUCCESS = STATUS_SUCCESS;
  static STATUS_STOP    = STATUS_STOP;

  constructor(status, value) {
    super();

    if (ALL_STATUSES.indexOf(status) < 0)
      throw new TypeError(`Unknown status provided to MatcherResult: "${status}".`);

    Object.defineProperties(this, {
      'status': {
        enumerable:   false,
        configurable: true,
        get:          () => status,
      },
      'value': {
        enumerable:   false,
        configurable: true,
        get:          () => value,
      },
    });
  }

  isSuccess() {
    return (this.status === STATUS_SUCCESS);
  }

  clone(_options) {
    let options = _options || {};
    let Klass   = options.Klass || this.constructor;

    if (Klass.constructor.length === 0)
      return new Klass();

    if (Klass.constructor.length === 1)
      return new Klass((Object.prototype.hasOwnProperty.call(options, 'value')) ? options.value : this.value);

    return new Klass(
      (Object.prototype.hasOwnProperty.call(options, 'status')) ? options.status : this.status,
      (Object.prototype.hasOwnProperty.call(options, 'value')) ? options.value : this.value,
    );
  }

  dynamicProperties() {
    return {
      [Utils.TO_PRIMITIVE_SYMBOL]:  () => this.value,
      'value':                      () => this.value,
      'status':                     () => ((this.status === STATUS_FAILED) ? 'failed' : 'success'),
    };
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON() {
    return {
      $type:    Utils.typeOf(this),
      status:   this.status,
      value:    this.value,
    };
  }

  async process(matcherScope) {
    return await this.finalizeProcess(matcherScope, this);
  }

  addChild(matcherScope, matcherResult, token) {
    let { thisMatcher } = matcherScope;
    if (!thisMatcher || typeof thisMatcher.addChild !== 'function')
      return;

    return thisMatcher.addChild(matcherScope, matcherResult, token);
  }

  updateParserRange(matcherScope, matcherResult, newRange) {
    let { thisMatcher } = matcherScope;
    if (!thisMatcher || typeof thisMatcher.updateParserRange !== 'function')
      return;

    return thisMatcher.updateParserRange(matcherScope, matcherResult, newRange);
  }

  updateParserOffset(matcherScope, matcherResult, offset) {
    let { thisMatcher } = matcherScope;
    if (!thisMatcher || typeof thisMatcher.updateParserOffset !== 'function')
      return matcherScope.context.parserRange;

    return thisMatcher.updateParserOffset(matcherScope, matcherResult, offset);
  }

  finalizeProcess(matcherScope, matcherResult) {
    let { thisMatcher } = matcherScope;
    if (!thisMatcher || typeof thisMatcher.finalizeProcess !== 'function')
      return;

    return thisMatcher.finalizeProcess(matcherScope, matcherResult);
  }
});
