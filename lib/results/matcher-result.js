import * as Utils   from '../utils.js';
import { TypeBase } from '../type-base.js';

const STATUS_FAILED   = Symbol.for('/adextopa/status/failed');
const STATUS_SUCCESS  = Symbol.for('/adextopa/status/success');
const ALL_STATUSES    = [ STATUS_FAILED, STATUS_SUCCESS ];

export const MatcherResult = Utils.makeKeysNonEnumerable(class MatcherResult extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'MatcherResult';

  static STATUS_FAILED  = STATUS_FAILED;
  static STATUS_SUCCESS = STATUS_SUCCESS;

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

  process() {
  }

  clone(status, value) {
    return new this.constructor(
      (arguments.length > 0) ? status : this.status,
      (arguments.length > 1) ? value : this.value,
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
});
