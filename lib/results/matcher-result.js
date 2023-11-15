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

  async process(scope) {
    return await this.finalizeProcess(scope, this);
  }

  addChild(scope, matcherResult, token) {
    let { matcher } = scope;
    if (!matcher || typeof matcher.addChild !== 'function')
      return;

    return matcher.addChild(scope, matcherResult, token);
  }

  updateParserRange(scope, matcherResult, newRange) {
    let { matcher } = scope;
    if (!matcher || typeof matcher.updateParserRange !== 'function')
      return;

    return matcher.updateParserRange(scope, matcherResult, newRange);
  }

  updateParserOffset(scope, matcherResult, offset) {
    let { matcher } = scope;
    if (!matcher || typeof matcher.updateParserOffset !== 'function')
      return;

    return matcher.updateParserOffset(scope, matcherResult, offset);
  }

  finalizeProcess(scope, matcherResult) {
    let { matcher } = scope;
    if (!matcher || typeof matcher.finalizeProcess !== 'function')
      return;

    return matcher.finalizeProcess(scope, matcherResult);
  }
});
