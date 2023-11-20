import * as Utils         from '../utils.js';
import { ProgramMatcher } from './program.js';
import { SwitchMatcher }  from './switch.js';
import { stringToFetch }  from './fetch.js';

export const IfMatcher = Utils.makeKeysNonEnumerable(class IfMatcher extends SwitchMatcher {
  static [Utils.TYPE_SYMBOL] = 'IfMatcher';

  static name = 'If';

  constructor(_options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'matchAll': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.matchAll,
      },
      'action': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.action,
      },
      'elseAction': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.elseAction,
      },
      'invert': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.invert,
      },
    });
  }

  clone(options) {
    return super.clone({
      matchesAll: this.matchesAll,
      matchers:   this.matchers,
      action:     this.action,
      elseAction: this.elseAction,
      invert:     this.invert,
      ...options,
    });
  }

  isTruthful(matcherScope, matcherResult) {
    if (matcherResult.isSuccessful())
      return 1;

    let value = matcherResult.value;
    if (value != null && value)
      return 2;

    let parserRange = matcherResult.parserRange;
    if (parserRange != null && (parserRange.start !== matcherScope.startOffset || parserRange.end !== matcherScope.endOffset))
      return 3;

    let parserOffset = matcherResult.parserOffset;
    if (parserOffset != null && parserOffset !== matcherScope.startOffset)
      return 4;

    return 0;
  }

  logResult(matcherScope, thruthyCode, matcherResult, isSuccess) {
    let {
      context,
      endOffset,
      matcherName,
      startOffset,
    } = matcherScope;

    let type = (isSuccess) ? 'Succeeded' : 'Failed';

    if (thruthyCode === 1) {
      let token = matcherResult.token;
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${type} because of successful resulting token: `, token);
    } else if (thruthyCode === 2) {
      let value = matcherResult.value;
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${type} because of successful resulting value: `, value);
    } else if (thruthyCode === 3) {
      let parserRange = matcherResult.parserRange;
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${type} because parser range would have been updated: ${context.debugColor('bg:cyan')}@${startOffset}-${endOffset}${context.debugColor('bg:black')} -> ${context.debugColor('bg:cyan')}@${parserRange.start}-${parserRange.end}${context.debugColor('bg:black')}`);
    } else if (thruthyCode === 4) {
      let parserOffset = matcherResult.parserOffset;
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${type} because parser offset would have been updated: ${context.debugColor('bg:cyan')}@${startOffset}-${endOffset}${context.debugColor('bg:black')} -> ${context.debugColor('bg:cyan')}@${startOffset + parserOffset}-${endOffset}${context.debugColor('bg:black')}`);
    } else {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${type} because of failure result from provider matcher.`);
    }
  }

  async callAction(matcherScope, action, matcherResult) {
    if (typeof action === 'function')
      return await action.call(this, matcherScope, matcherResult);

    return await matcherScope.context.exec(action);
  }

  async handleTruthyResult(matcherScope, thruthyCode, matcherResult) {
    this.logResult(matcherScope, thruthyCode, matcherResult, true);
    return await this.callAction(matcherScope, matcherScope.action, matcherResult);
  }

  async handleFalsyResult(matcherScope, thruthyCode, matcherResult) {
    this.logResult(matcherScope, thruthyCode, matcherResult, false);

    let {
      context,
      elseAction,
      startOffset,
      matcherName,
    } = matcherScope;

    if (elseAction) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Running "Else" matcher...`);
      return await this.callAction(matcherScope, elseAction, matcherResult);
    }

    return context.updateParserOffsetResult(startOffset).setToken(null).setValue(null).setParserRange(null);
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      condition:  context.resolveValue(this.condition),
      action:     context.resolveValue(this.action),
      elseAction: context.resolveValue(this.elseAction),
      invert:     context.resolveValue(this.invert),
    };
  }

  // Add results as children so
  // the process succeeds instead
  // of fails. The resulting token
  // is rejected anyhow, so this is
  // a non-issue.
  handleResultValue(matcherScope, value) {
    let {
      processToken,
    } = matcherScope;

    processToken.addChild(value);
  }

  async handleMatcherResult(matcherScope, matcherResult) {
    let finalResult;

    if (this.matchAll)
      finalResult = await ProgramMatcher.prototype.handleMatcherResult.call(this, matcherScope, matcherResult);
    else
      finalResult = await SwitchMatcher.prototype.handleMatcherResult.call(this, matcherScope, matcherResult);

    return finalResult;
  }

  async exec(matcherScope) {
    let {
      invert,
    } = matcherScope;

    let matcherResult = await super.exec(matcherScope);
    let thruthyCode   = this.isTruthful(matcherScope, matcherResult);
    if (thruthyCode > 0)
      return (invert) ? await this.handleFalsyResult(matcherScope, thruthyCode, matcherResult) : await this.handleTruthyResult(matcherScope, thruthyCode, matcherResult);
    else
      return (invert) ? await this.handleTruthyResult(matcherScope, thruthyCode, matcherResult) : await this.handleFalsyResult(matcherScope, thruthyCode, matcherResult);
  }

  Then(action) {
    this.action = action;
    return this;
  }

  Else(elseAction) {
    this.elseAction = elseAction;
    return this;
  }

  Invert(set) {
    this.invert = !!set;
    return this;
  }
});

export function IfAll(...matchers) {
  return new IfMatcher({
    matchers: matchers.map(stringToFetch).filter(Boolean),
    matchAll: true,
  });
}

export const If = IfAll;

export function IfAny(...matchers) {
  return new IfMatcher({
    matchers:   matchers.map(stringToFetch).filter(Boolean),
    matchAll:   false,
  });
}

export function IfNotAll(...matchers) {
  return IfAll(...matchers).Invert(true).name('IfNotAll');
}

export const IfNot = IfNotAll;

export function IfNotAny(...matchers) {
  return IfAny(...matchers).Invert(true).name('IfNotAny');
}
