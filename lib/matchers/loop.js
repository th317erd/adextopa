import * as Utils       from '../utils.js';
import { SourceRange }    from '../source-range.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { Matcher }        from '../matcher.js';
import { Token }          from '../token.js';
import { stringToFetch }  from './fetch.js';

// This is both a Program and a Loop
// Matcher. They share (roughly) the
// same code because they are nearly
// identical in functionality. A
// Program is simply a Loop with an
// iteration count of 1.

const PROCESS_CODE_BREAK    = 0;
const PROCESS_CODE_RESTART  = 1;
const PROCESS_CODE_NEXT     = 2;

const EMPTY_RESULT = {
  type:   MatcherResult.RESULT_EMPTY,
  value:  null,
};

export const LoopMatcher = Utils.makeKeysNonEnumerable(class LoopMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'LoopMatcher';

  static PROCESS_CODE_BREAK    = PROCESS_CODE_BREAK;
  static PROCESS_CODE_RESTART  = PROCESS_CODE_RESTART;
  static PROCESS_CODE_NEXT     = PROCESS_CODE_NEXT;

  static name = 'Loop';

  static hasOwnScope() {
    return true;
  }

  constructor(_opts) {
    let opts = _opts || {};

    super(opts);

    Object.defineProperties(this, {
      'matchers': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.matchers || [],
      },
      'startIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.startIndex || 0,
      },
      'endIndex': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.endIndex || Infinity,
      },
      'step': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.step || 1,
      },
    });
  }

  updateFromTokenRanges({ processToken, start, end }, matcher, matcherResult) {
    let token     = matcherResult.value;
    let loopRange = { start, end };

    if (!processToken._firstCaptureRangeProcessed) {
      Object.defineProperties(processToken, {
        '_firstCaptureRangeProcessed': {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        true,
        },
      });

      processToken.capturedRange.start = token.capturedRange.start;
    }

    if (token.capturedRange.end > processToken.capturedRange.end)
      processToken.capturedRange.end = token.capturedRange.end;

    if (token.capturedRange.end > processToken.matchedRange.end)
      processToken.matchedRange.end = token.capturedRange.end;

    processToken.capturedRange.ensureBounds(loopRange);
    processToken.matchedRange.ensureBounds(loopRange);
  }

  updateContextRange({ context, processToken, start, end }, matcher, matcherResult) {
    let token       = matcherResult.value;
    let loopRange   = { start, end };

    // Only update the parsing range if the matcher is a consuming matcher
    if (matcher.isConsuming() && token.parserRange.end > context.range.start)
      context.range.start = processToken.offset = token.parserRange.end;

    context.range.ensureBounds(loopRange);
  }

  updateLoopTokenRanges(scope, matcher, matcherResult) {
    this.updateFromTokenRanges(scope, matcher, matcherResult);
    this.updateContextRange(scope, matcher, matcherResult);
  }

  createProcessResponse(_scope, processCode, result) {
    return {
      processCode,
      result,
    };
  }

  processMatcherResultPayload(scope, matcher, _matcherResult) {
    let matcherResult = _matcherResult;
    if (matcherResult && matcherResult.payload)
      this.processMatcherResult(scope, matcher, matcherResult.payload);

    return MatcherResult.cloneMatcherResult(matcherResult, {
      payload: this.finalizeToken(scope),
    });
  }

  [MatcherResult.RESULT_EMPTY](scope, _matcher) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because matcher returned an empty result.`);

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_BREAK,
      this.failResult(context),
    );
  }

  [MatcherResult.RESULT_PANIC](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because an error is being passed upstream. Error: ${matcherResult.value.message}`);

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_BREAK,
      this.processMatcherResultPayload(scope, matcher, matcherResult),
    );
  }

  [MatcherResult.RESULT_FAIL](scope, _matcher, _matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because of a failure.`);

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_BREAK,
      this.finalizeToken(scope),
    );
  }

  [MatcherResult.RESULT_HALT](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because of a halt request.`);

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_BREAK,
      this.processMatcherResultPayload(scope, matcher, matcherResult),
    );
  }

  [MatcherResult.RESULT_BREAK](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    let result = this.processMatcherResultPayload(scope, matcher, matcherResult);

    if (!matcherResult.value) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking!`);
      result = result.payload; // Finalized token
    } else if (matcherResult.value === matcherName) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking because of a "break" request.`);
      result = result.payload; // Finalized token
    } else {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking because a "break" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
    }

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_BREAK,
      result,
    );
  }

  [MatcherResult.RESULT_CONTINUE](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    let result = this.processMatcherResultPayload(scope, matcher, matcherResult);

    if (!matcherResult.value) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing!`);
      result = result.payload; // Finalized token
    } else if (matcherResult.value === matcherName) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing because of a "continue" request.`);
      result = result.payload; // Finalized token
    } else {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing because a "continue" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
    }

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_RESTART,
      result,
    );
  }

  [MatcherResult.RESULT_TOKEN](scope, matcher, matcherResult) {
    if (matcherResult.value.isProxy())
      return this.processProxyToken(scope, matcher, matcherResult);
    else
      return this.processToken(scope, matcher, matcherResult);
  }

  processToken(scope, matcher, matcherResult) {
    let {
      context,
      processToken,
      matcherName,
    } = scope;

    let token = matcherResult.value;

    if (!matcher.skipLogging('token', 'Loop:RESULT_TOKEN'))
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Adding captured token.`, token);

    this.updateLoopTokenRanges(scope, matcher, matcherResult);

    token.parent = processToken;
    processToken.children.push(token);

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_NEXT,
    );
  }

  processProxyToken(scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
    } = scope;

    let token = matcherResult.value;

    if (!matcher.skipLogging('proxyChildren', 'Loop:RESULT_PROXY_TOKEN', 'Loop:RESULT_TOKEN'))
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Adding captured tokens (proxy children).`, token);

    this.updateLoopTokenRanges(scope, matcher, matcherResult);

    for (let child of token.children.values())
      this[MatcherResult.RESULT_TOKEN](scope, matcher, this.tokenResult(context, child));

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_NEXT,
    );
  }

  [MatcherResult.RESULT_SKIP](scope, matcher, matcherResult) {
    let {
      context,
      processToken,
      matcherName,
    } = scope;

    let skipAmount            = matcherResult.value || 0;
    let newStart              = context.range.start + skipAmount;
    let matcherResultOptions  = (typeof matcherResult.getOptions === 'function') ? matcherResult.getOptions() : {};

    if (!matcher.skipLogging('skip', 'Loop:RESULT_SKIP'))
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Skipping by ${context.debugColor('bg:cyan')}${skipAmount}${context.debugColor('bg:black')} to new offset ${context.debugColor('bg:cyan')}${newStart}${context.debugColor('bg:black')}.`);

    if (newStart > processToken.matchedRange.end)
      processToken.matchedRange.end = newStart;

    if (matcherResultOptions.capturedRange)
      this.updateFromTokenRanges(scope, matcher, { value: matcherResultOptions });

    context.range.start = processToken.offset = newStart;

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT);
  }

  [MatcherResult.RESULT_SEEK](scope, matcher, matcherResult) {
    let {
      context,
      processToken,
      matcherName,
    } = scope;

    let range = matcherResult.value || 0;

    if (!matcher.skipLogging('seek', 'Loop:RESULT_SEEK'))
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Seeking to new range ${context.debugColor('bg:cyan')}${range}${context.debugColor('bg:black')}.`);

    processToken.matchedRange = range.clone();
    context.range = range.clone();

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT);
  }

  processMatcherResult(scope, matcher, matcherResult) {
    return this[matcherResult.type](scope, matcher, matcherResult);
  }

  isProcessSuccessful(scope) {
    let {
      processToken,
      start,
    } = scope;

    if (processToken.matchedRange.end === start && processToken.children.length === 0)
      return false;

    return true;
  }

  finalizeToken(scope) {
    if (!this.isProcessSuccessful(scope))
      return;

    let {
      context,
      processToken,
      matcherName,
      typeName,
    } = scope;

    let source  = context.getSource();
    let value   = source.substring(processToken.capturedRange.start, processToken.capturedRange.end);

    processToken.matchedValue = source.substring(processToken.matchedRange.start, processToken.matchedRange.end);
    processToken.capturedValue = value;
    processToken.value = value;
    processToken.context = context.cloneWithRange(processToken.matchedRange);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

    return this.tokenResult(
      context,
      processToken,
    );
  }

  async executeMatcher(scope, matcher) {
    let {
      context,
      matcherName,
    } = scope;

    if (!(matcher instanceof Matcher))
      this.throwError(context, `${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    let matcherResult = await context.exec(matcher);
    return this.processMatcherResult(scope, matcher, matcherResult || EMPTY_RESULT);
  }

  async executeMatchers(scope) {
    let {
      context,
      end,
      processToken,
      matcherName,
      matchers,
      typeName,
    } = scope;

    let result;

    for (let matcher of matchers) {
      let resolvedMatcher = context.resolveValue(matcher, { wantPrimitiveValue: false });
      if (!(resolvedMatcher instanceof Matcher) && matcher instanceof Matcher)
        resolvedMatcher = matcher;

      if (processToken.offset >= end && resolvedMatcher.isConsuming()) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
        return this.createProcessResponse(scope, PROCESS_CODE_BREAK, (result && result.result));
      }

      result = await this.executeMatcher(scope, resolvedMatcher);
      if (result.processCode !== PROCESS_CODE_NEXT)
        return result;

      if (result.result == null)
        result = undefined;
    }

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT, (result && result.result));
  }

  async exec(context) {
    let matchers    = Array.from(this.matchers.values()).filter(Boolean);
    let start       = context.range.start;
    let end         = context.range.end;
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let typeName    = ('' + this.constructor.name);
    let processToken   = new Token(context, {
      name:          matcherName,
      capturedRange: new SourceRange(start, start),
      matchedRange:  new SourceRange(start, start),
    });

    if (this.hasOwnScope()) {
      context.assignToScope({
        [matcherName]:  processToken,
        '_':            processToken,
      });
    }

    let startIndex  = parseFloat(context.resolveValue(this.startIndex, { wantPrimitiveValue: true, defaultValue: 0 }));
    let endIndex    = parseFloat(context.resolveValue(this.endIndex, { wantPrimitiveValue: true, defaultValue: Infinity }));
    let step        = parseFloat(context.resolveValue(this.step, { wantPrimitiveValue: true, defaultValue: 1 }));

    if (isNaN(startIndex))
      startIndex = 0;

    if (isNaN(endIndex))
      endIndex = startIndex;

    if (isNaN(step))
      step = 1;

    if (startIndex > endIndex)
      step = -1;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Starting loop/iteration ${context.debugColor('bg:cyan')}@${start}-${context.range.end}${context.debugColor('bg:black')} [${this.debugPosition(context)}]: { startIndex: ${startIndex}, endIndex: ${endIndex} }`);

    if (!matchers.length) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because no matchers were provided.`);
      return this.failResult(context);
    }

    let scope = {
      context,
      matchers,
      matcherName,
      typeName,
      processToken,
      start,
      end,
    };

    for (let index = startIndex; ;) {
      if (startIndex < endIndex && index >= endIndex)
        break;
      else if (startIndex > endIndex && index <= startIndex)
        break;
      else if (startIndex === endIndex)
        break;

      if (processToken.offset >= end) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
        break;
      }

      let {
        result,
        processCode,
      } = await this.executeMatchers(scope);

      if (processCode === PROCESS_CODE_NEXT || processCode === PROCESS_CODE_RESTART) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} iterator incrementing from ${index} to ${index + step}!`);
        index += step;

        continue;
      }

      if (processCode === PROCESS_CODE_BREAK) {
        if (result)
          return result;

        break;
      }
    }

    let finalToken = this.finalizeToken(scope);
    if (!finalToken) {
      // If nothing was matched, then fail
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
      return this.failResult(context);
    }

    return finalToken;
  }
});

export function Loop(/* name?, ...matchers */) {
  let args = Array.from(arguments);
  let name = args[0];

  if (typeof name === 'string' || Matcher.isVirtualMatcher(name))
    args = args.slice(1);
  else
    name = undefined;

  return new LoopMatcher({
    name,
    matchers: args.map(stringToFetch),
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

  return new LoopMatcher({
    name,
    startIndex,
    endIndex,
    step,
    matchers: args.slice(argIndex).map(stringToFetch),
  });
}
