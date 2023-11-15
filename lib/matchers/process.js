import * as Utils         from '../utils.js';
import { SourceRange }    from '../source-range.js';
import { Matcher }        from '../matcher.js';
import { Token }          from '../token.js';
import { stringToFetch }  from './fetch.js';

import {
  TokenMatcherResult,
} from '../results/index.js';

// This is a Program, a Loop, a Switch, and a Pin
// and possibly more. A "process" is any repeating consumer.
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

  static TokenMatcherResult = Utils.makeKeysNonEnumerable(class ProcessTokenMatcherResult extends TokenMatcherResult {
    static [Utils.TYPE_SYMBOL] = 'ProcessTokenMatcherResult';

    async finalizeProcess(matcherScope, result) {
      let {
        thisMatcher,
        processToken,
        parserRange,
      } = matcherScope;

      let token = result.value;
      processToken.capturedRange.expandTo(token.capturedRange).clampTo(parserRange);
      processToken.matchedRange.expandTo(token.matchedRange).clampTo(parserRange);

      return await thisMatcher.nextMatcher.call(thisMatcher, matcherScope);
    }
  });

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
      'startIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.startIndex || 0,
      },
      'endIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.endIndex || Infinity,
      },
      'step': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.step || 1,
      },
    });
  }

  addChild(matcherScope, matcherResult, token) {
    this.processToken.addChild(token);
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

    if (!(matcher instanceof Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    return await context.exec(matcher);
  }

  processScopeAssign(matcherScope, options) {
    let obj = Object.create(matcherScope);
    return Object.assign(obj, options || {});
  }

  async handleMatcherResult(matcherScope, _matcherResult) {
    let matcherResult = matcherScope.context.cloneToCustomMatcherResult(this, _matcherResult);
    return await matcherResult.process(matcherScope);
  }

  async nextMatcher(matcherScope) {
    let {
      currentMatcherIndex,
    } = matcherScope;

    return await this.processMatcher(this.processScopeAssign(matcherScope, { currentMatcherIndex: currentMatcherIndex + 1 }));
  }

  async processMatcher(matcherScope) {
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
      return await this.nextIteration(matcherScope);

    let currentMatcher  = matchers[currentMatcherIndex];
    let resolvedMatcher = context.resolveValue(currentMatcher);
    if (currentMatcher !== resolvedMatcher && !Utils.isType(resolvedMatcher, Matcher) && Utils.isType(currentMatcher, Matcher))
      resolvedMatcher = currentMatcher;

    if (!Utils.isType(resolvedMatcher, Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    if (processToken.offset >= endOffset && resolvedMatcher.isConsuming()) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
      return;
    }

    let matcherResult = await this.executeMatcher(matcherScope, resolvedMatcher);
    return await this.handleMatcherResult(matcherScope, matcherResult);
  }

  async nextIteration(matcherScope) {
    let {
      currentIterationIndex,
      step,
    } = matcherScope;

    return await this.processIteration(this.processScopeAssign(matcherScope, { currentIterationIndex: currentIterationIndex + step }));
  }

  async processIteration(matcherScope) {
    let {
      currentIterationIndex,
      endIndex,
      startIndex,
    } = matcherScope;

    if (startIndex === endIndex)
      return;

    if (startIndex < endIndex && currentIterationIndex >= endIndex)
      return;

    if (startIndex > endIndex && currentIterationIndex <= startIndex)
      return;

    return await this.processMatcher(this.processScopeAssign(matcherScope, { currentMatcherIndex: 0 }));
  }

  createMatcherScope(context) {
    let matcherScope  = super.createMatcherScope(context);
    let startIndex    = parseFloat(context.resolvePrimitive(this.startIndex, { defaultValue: 0 }));
    let endIndex      = parseFloat(context.resolvePrimitive(this.endIndex, { defaultValue: Infinity }));
    let step          = parseFloat(context.resolvePrimitive(this.step, { defaultValue: 1 }));

    if (isNaN(startIndex))
      startIndex = 0;

    if (isNaN(endIndex))
      endIndex = startIndex;

    if (isNaN(step))
      step = 1;

    if (startIndex > endIndex)
      step = -1;

    let range         = new SourceRange(matcherScope.startOffset, matcherScope.startOffset);
    let processToken  = this.processToken = new Token(context, {
      name:          matcherScope.matcherName,
      capturedRange: range,
      matchedRange:  range.clone(),
    });

    return {
      ...matcherScope,
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
      startOffset,
      startIndex,
      endIndex,
    } = matcherScope;

    if (this.hasOwnScope()) {
      context.assign({
        [matcherName]:  processToken,
        '_':            processToken,
      });
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Starting iteration ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.end}${context.debugColor('bg:black')} [${context.debugPosition()}]: { startIndex: ${startIndex}, endIndex: ${endIndex} }`);

    if (!matchers.length) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because no matchers were provided.`);
      return context.failResult();
    }

    await this.processIteration(matcherScope);

    if (!this.isProcessSuccessful(matcherScope)) {
      // If nothing was matched, then fail
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
      return context.failResult();
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

    return context.tokenResult(
      processToken,
    );
  }
});

export function Loop(/* name?, ...matchers */) {
  let args      = Array.from(arguments);
  let argIndex  = 0;
  let name      = (typeof args[argIndex] === 'string' || Matcher.isVirtualMatcher(args[argIndex])) ? args[argIndex++] : 'Loop';

  return new ProcessMatcher({
    name:     name || 'Loop',
    matchers: args.slice(argIndex).map(stringToFetch).filter(Boolean),
  });
}

export function Iterate(/* name?, startIndex?, endIndex?, ...matchers */) {
  let args        = Array.from(arguments);
  let argIndex    = 0;
  let name        = (typeof args[argIndex] === 'string' || Matcher.isVirtualMatcher(args[argIndex])) ? args[argIndex++] : undefined;
  let startIndex  = (typeof args[argIndex] === 'number' || Matcher.isVirtualMatcher(args[argIndex])) ? args[argIndex++] : undefined;
  let endIndex    = (typeof args[argIndex] === 'number' || Matcher.isVirtualMatcher(args[argIndex])) ? args[argIndex++] : undefined;
  let step        = (typeof args[argIndex] === 'number' || Matcher.isVirtualMatcher(args[argIndex])) ? args[argIndex++] : undefined;

  if (endIndex == null && typeof startIndex === 'number') {
    endIndex = startIndex;
    startIndex = 0;
  }

  return new ProcessMatcher({
    name:     name || 'Iterate',
    matchers: args.slice(argIndex).map(stringToFetch).filter(Boolean),
    startIndex,
    endIndex,
    step,
  });
}
