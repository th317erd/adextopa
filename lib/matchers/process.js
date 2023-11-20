import * as Utils         from '../utils.js';
import { SourceRange }    from '../source-range.js';
import { Matcher }        from '../matcher.js';
import { Token }          from '../token.js';
import { stringToFetch }  from './fetch.js';

// This is a Program, a Loop, a Switch, and possibly
// more. A "process" is any repeating consumer.
// Program, Loop, Switch, etc... all share (roughly) the
// same code because they are nearly identical in functionality.
// A Program is simply a Loop with an iteration count of 1
// for example. A Switch is just a Program that skips
// to the next matcher on failure (vs failing for a Program).

export const ProcessMatcher = Utils.makeKeysNonEnumerable(class ProcessMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ProcessMatcher';

  static name = 'Process';

  static hasOwnScope() {
    return true;
  }

  constructor(_options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'matchers': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.matchers || [],
      },
    });
  }

  clone(options) {
    return super.clone({
      matchers: this.matchers,
      ...(options || {}),
    });
  }

  isProcessSuccessful(matcherScope) {
    let {
      processToken,
      startOffset,
    } = matcherScope;

    if (processToken.matchedRange.end === startOffset && processToken.children.length === 0)
      return false;

    return true;
  }

  async executeMatcher(matcherScope, matcher) {
    let {
      context,
      matcherName,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    return await context.exec(matcher);
  }

  processScopeAssign(matcherScope, options) {
    let obj = Object.create(matcherScope);
    return Object.assign(obj, options || {});
  }

  addChild(matcherScope, token) {
    if (!token)
      return this;

    let { processToken } = matcherScope;
    if (token.proxyChildren()) {
      for (let child of token.children)
        processToken.addChild(child, false);
    } else {
      processToken.addChild(token, false);
    }

    return this;
  }

  handleResultValue(_matcherScope, _value) {
    // NOOP
  }

  updateCapturedRange(matcherScope, range) {
    if (!range)
      return this;

    let { processToken, matcherRange, rangeState } = matcherScope;
    if (rangeState.capturedRangeUpdated) {
      processToken.capturedRange.expandTo(range).clampTo(matcherRange);
    } else {
      processToken.capturedRange.setTo(range).clampTo(matcherRange);
      rangeState.capturedRangeUpdated = true;
    }

    return this;
  }

  updateMatchedRange(matcherScope, range) {
    if (!range)
      return this;

    let { processToken, matcherRange, rangeState } = matcherScope;
    if (rangeState.matchedRangeUpdated) {
      processToken.matchedRange.expandTo(range).clampTo(matcherRange);
    } else {
      processToken.matchedRange.setTo(range).clampTo(matcherRange);
      rangeState.matchedRangeUpdated = true;
    }

    return this;
  }

  updateParserOffset(matcherScope, offset) {
    if (!Utils.isType(offset, 'Number') || !isFinite(offset))
      return this;

    let { matcherRange, rangeState } = matcherScope;
    rangeState.parserRangeUpdated = true;

    return this.setParserRange(matcherScope, new SourceRange(offset, matcherRange.end));
  }

  setParserRange(matcherScope, range) {
    if (!range)
      return this;

    let {
      context,
      matcherRange,
      matcherName,
      typeName,
      rangeState,
    } = matcherScope;

    let newRange = range.clone().clampTo(matcherRange);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} updating parser range to ${context.debugColor('bg:cyan')}@${newRange.start}-${newRange.end}${context.debugColor('bg:black')}`);

    context.parserRange.setTo(newRange);
    rangeState.parserRangeUpdated = true;

    return this;
  }

  applyMatcherResult(matcherScope, matcherResult) {
    let token = matcherResult.token;
    if (token)
      this.addChild(matcherScope, token);

    let value = matcherResult.value;
    if (value != null) {
      if (Utils.isType(value, 'Token', Token))
        this.addChild(matcherScope, value);
      else
        this.handleResultValue(matcherScope, value);
    }

    let capturedRange = matcherResult.capturedRange;
    if (capturedRange)
      this.updateCapturedRange(matcherScope, capturedRange);

    let matchedRange = matcherResult.matchedRange;
    if (matchedRange)
      this.updateMatchedRange(matcherScope, matchedRange);

    let parserRange = matcherResult.parserRange;
    if (parserRange)
      this.setParserRange(matcherScope, parserRange);

    // This will only update if the offset is a valid number
    let parserOffset = matcherResult.parserOffset;
    this.updateParserOffset(matcherScope, parserOffset);
  }

  async handleMatcherResult(matcherScope, matcherResult, onProcessEnded) {
    let {
      context,
      matcherName,
      typeName,
    } = matcherScope;

    // First, handle important messages
    if (matcherResult.panic) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because of a panic! Passing "panic" upstream...`);
      return matcherResult;
    } else if (matcherResult.failed) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} matcher failed! ${typeName} terminating!`);
      return this.processEndedResult(matcherScope);
    } else if (matcherResult.halt) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "halt" request received! Passing "halt" upstream...`);
    }

    // Apply the result to "processToken"
    await this.applyMatcherResult(matcherScope, matcherResult);

    // Handle break request
    let breakTarget = matcherResult.break;
    if (breakTarget != null) {
      if (!breakTarget || breakTarget === matcherName) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "break" request received! Breaking...`);
        return this.processEndedResult(matcherScope);
      } else if (breakTarget) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "break" request received (targeting ${breakTarget})! Passing "break" upstream...`);
        return this.processEndedResult(matcherScope).setBreak(breakTarget);
      }
    }

    // Handle continue request
    let continueTarget = matcherResult.continue;
    if (continueTarget != null) {
      if (!continueTarget || continueTarget === matcherName) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "continue" request received! Continuing...`);
        return await await this.nextIteration(matcherScope, onProcessEnded);
      } else if (continueTarget) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "continue" request received (targeting ${continueTarget})! Passing "continue" upstream...`);
        return this.processEndedResult(matcherScope).setContinue(continueTarget);
      }
    }

    return await this.nextMatcher(matcherScope);
  }

  async nextMatcher(matcherScope, onProcessEnded) {
    let {
      currentMatcherIndex,
    } = matcherScope;

    return await this.processMatcher(
      this.processScopeAssign(matcherScope, { currentMatcherIndex: currentMatcherIndex + 1 }),
      onProcessEnded,
    );
  }

  async processMatcher(matcherScope, onProcessEnded) {
    let {
      context,
      currentMatcherIndex,
      endOffset,
      matcherName,
      matchers,
      processToken,
      typeName,
    } = matcherScope;

    if (currentMatcherIndex >= matchers.length)
      return await this.nextIteration(matcherScope, onProcessEnded);

    let currentMatcher  = matchers[currentMatcherIndex];
    let resolvedMatcher = context.resolveValue(currentMatcher);
    if (currentMatcher !== resolvedMatcher && !Utils.isType(resolvedMatcher, 'Matcher', Matcher) && Utils.isType(currentMatcher, 'Matcher', Matcher))
      resolvedMatcher = currentMatcher;

    if (!Utils.isType(resolvedMatcher, Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    if (processToken.offset >= endOffset && resolvedMatcher.isConsuming()) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
      return;
    }

    let matcherResult = await this.executeMatcher(matcherScope, resolvedMatcher);
    return await this.handleMatcherResult(matcherScope, matcherResult, onProcessEnded);
  }

  async nextIteration(matcherScope, onProcessEnded) {
    let {
      currentIterationIndex,
      step,
    } = matcherScope;

    return await this.processIteration(
      this.processScopeAssign(matcherScope, { currentIterationIndex: currentIterationIndex + step }),
      onProcessEnded,
    );
  }

  async processIteration(matcherScope, onProcessEnded) {
    let {
      context,
      currentIterationIndex,
      endIndex,
      matcherName,
      matcherRange,
      startIndex,
      startOffset,
    } = matcherScope;

    this.setAttribute('index', currentIterationIndex);

    let iterationEnded = (
      (startIndex === endIndex) ||
      (startIndex < endIndex && currentIterationIndex >= endIndex) ||
      (startIndex > endIndex && currentIterationIndex <= startIndex) ||
      (context.parserRange.start >= matcherRange.end)
    );

    if (iterationEnded) {
      if (typeof onProcessEnded === 'function')
        return onProcessEnded.call(this, matcherScope);
      else
        return this.processEndedResult(matcherScope);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Starting iteration ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.end}${context.debugColor('bg:black')} [${context.debugPosition()}]: { startIndex: ${startIndex}, currentIndex: ${currentIterationIndex}, endIndex: ${endIndex} }`);

    return await this.processMatcher(this.processScopeAssign(matcherScope, { currentMatcherIndex: 0 }));
  }

  processEndedResult(matcherScope) {
    let {
      context,
      matcherName,
      processToken,
      typeName,
    } = matcherScope;

    if (!this.isProcessSuccessful(matcherScope)) {
      // If nothing was matched, then fail
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
      return context.failResult();
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

    return context.tokenResult(processToken);
  }

  createMatcherScope(context) {
    let matcherScope  = super.createMatcherScope(context);
    let startIndex    = parseFloat(context.resolveValueToNumber(this.getAttribute('start'), { defaultValue: 0 }));
    let endIndex      = parseFloat(context.resolveValueToNumber(this.getAttribute('end'), { defaultValue: Infinity }));
    let step          = parseFloat(context.resolveValueToNumber(this.getAttribute('step'), { defaultValue: 1 }));

    if (isNaN(startIndex))
      startIndex = 0;

    if (isNaN(endIndex))
      endIndex = startIndex;

    if (isNaN(step))
      step = 1;

    if (startIndex > endIndex)
      step = -1;

    let range         = new SourceRange(matcherScope.startOffset, matcherScope.startOffset);
    let processToken  = this.processToken = new Token(context, null, {
      name:          matcherScope.matcherName,
      capturedRange: range,
      matchedRange:  range.clone(),
    });

    matcherScope.thisMatcher.setAttribute('token', processToken);

    return {
      ...matcherScope,
      rangeState:             { capturedRangeUpdated: false, matchedRangeUpdated: false, parserRangeUpdated: false },
      currentIterationIndex:  startIndex,
      currentMatcherIndex:    0,
      matchers:               this.matchers,
      processToken,
      startIndex,
      endIndex,
      step,
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      processToken,
      typeName,
      matchers,
    } = matcherScope;

    if (this.hasOwnScope()) {
      context.assign({
        '_': processToken,
      });
    }

    if (!matchers.length) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because no matchers were provided.`);
      return context.failResult();
    }

    return await this.processIteration(matcherScope);
  }
});

export function Loop(...matchers) {
  return (new ProcessMatcher({
    matchers:   matchers.map(stringToFetch).filter(Boolean),
    attributes: {
      start:  0,
      end:    Infinity,
      step:   1,
    },
  })).name('Loop');
}
