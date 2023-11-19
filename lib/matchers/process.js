import * as Utils         from '../utils.js';
import { SourceRange }    from '../source-range.js';
import { Matcher }        from '../matcher.js';
import { Token }          from '../token.js';
import { stringToFetch }  from './fetch.js';
import { MatcherResult }  from '../results/index.js';

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

    if (!Utils.isType(matcher, Matcher))
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
    if (token.proxyChildren) {
      for (let child of token.children)
        processToken.addChild(child, false);
    } else {
      processToken.addChild(token, false);
    }

    return this;
  }

  updateCapturedRange(matcherScope, range) {
    if (!range)
      return this;

    let { processToken, matcherRange } = matcherScope;
    processToken.capturedRange.expandTo(range).clampTo(matcherRange);

    return this;
  }

  updateMatchedRange(matcherScope, range) {
    if (!range)
      return this;

    let { processToken, matcherRange } = matcherScope;
    processToken.matchedRange.expandTo(range).clampTo(matcherRange);

    return this;
  }

  updateParserOffset(matcherScope, offset) {
    if (!Utils.isType(offset, 'Number') || !isFinite(offset))
      return this;

    let { matcherRange } = matcherScope;
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
    } = matcherScope;

    let newRange = range.clone().clampTo(matcherRange);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} updating parser range to ${context.debugColor('bg:cyan')}@${newRange.start}-${newRange.end}${context.debugColor('bg:black')}`);

    context.parserRange.setTo(newRange);

    return this;
  }

  applyMatcherResult(matcherScope, matcherResult) {
    let token = matcherResult.get(MatcherResult.TOKEN);
    if (token)
      this.addChild(matcherScope, token);

    let capturedRange = matcherResult.get(MatcherResult.CAPTURED_RANGE);
    if (capturedRange)
      this.updateCapturedRange(matcherScope, capturedRange);

    let matchedRange = matcherResult.get(MatcherResult.MATCHED_RANGE);
    if (matchedRange)
      this.updateMatchedRange(matcherScope, matchedRange);

    let parserRange = matcherResult.get(MatcherResult.PARSER_RANGE);
    if (parserRange)
      this.setParserRange(matcherScope, parserRange);

    // This will only update if the offset is a valid number
    let parserOffset = matcherResult.get(MatcherResult.PARSER_OFFSET);
    this.updateParserOffset(matcherScope, parserOffset);
  }

  async handleMatcherResult(matcherScope, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = matcherScope;

    // First, handle important messages
    if (matcherResult.get(MatcherResult.PANIC)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because of a panic! Passing "panic" upstream...`);
      return matcherResult;
    } else if (matcherResult.get(MatcherResult.FAILED)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} matcher failed! Loop terminating!`);
    } else if (matcherResult.get(MatcherResult.HALT)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} halt request received! Passing "halt" upstream...`);
    }

    // Apply the result to "processToken"
    await this.applyMatcherResult(matcherScope, matcherResult);

    return await this.nextMatcher(matcherScope);
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
      context,
      currentIterationIndex,
      endIndex,
      matcherName,
      matcherRange,
      processToken,
      startIndex,
      startOffset,
      typeName,
    } = matcherScope;

    this.setAttribute('index', currentIterationIndex);

    let iterationEnded = (
      (startIndex === endIndex) ||
      (startIndex < endIndex && currentIterationIndex >= endIndex) ||
      (startIndex > endIndex && currentIterationIndex <= startIndex) ||
      (context.parserRange.start >= matcherRange.end)
    );

    if (iterationEnded) {
      if (!this.isProcessSuccessful(matcherScope)) {
        // If nothing was matched, then fail
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
        return context.failResult();
      }

      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

      return context.tokenResult(processToken);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Starting iteration ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.end}${context.debugColor('bg:black')} [${context.debugPosition()}]: { startIndex: ${startIndex}, endIndex: ${endIndex} }`);

    return await this.processMatcher(this.processScopeAssign(matcherScope, { currentMatcherIndex: 0 }));
  }

  createMatcherScope(context) {
    let matcherScope  = super.createMatcherScope(context);
    let startIndex    = parseFloat(context.resolveValue(this.getAttribute('start'), { defaultValue: 0 }));
    let endIndex      = parseFloat(context.resolveValue(this.getAttribute('end'), { defaultValue: Infinity }));
    let step          = parseFloat(context.resolveValue(this.getAttribute('step'), { defaultValue: 1 }));

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
