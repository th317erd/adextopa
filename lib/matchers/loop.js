import { SourceRange }    from '../source-range.js';
import { MatcherResult }  from '../matcher-result.js';
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

export class LoopMatcher extends Matcher {
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

  updateCapturedRange({ loopToken, start, end }, matcher, matcherResult) {
    let token     = matcherResult.value;
    let loopRange = { start, end };

    if (!loopToken._firstCaptureRangeProcessed) {
      Object.defineProperties(loopToken, {
        '_firstCaptureRangeProcessed': {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        true,
        },
      });

      loopToken.capturedRange.start = token.capturedRange.start;
    }

    if (token.capturedRange.end > loopToken.capturedRange.end)
      loopToken.capturedRange.end = token.capturedRange.end;

    loopToken.capturedRange.ensureBounds(loopRange);
  }

  updateMatchedRange({ loopToken, start, end }, matcher, matcherResult) {
    let token     = matcherResult.value;
    let loopRange = { start, end };

    if (token.capturedRange.end > loopToken.matchedRange.end)
      loopToken.matchedRange.end = token.matchedRange.end;

    loopToken.matchedRange.ensureBounds(loopRange);
  }

  updateContextRange({ context, loopToken, start, end }, matcher, matcherResult) {
    let token     = matcherResult.value;
    let loopRange = { start, end };

    // Only update the parsing range if the matcher is a consuming matcher
    if (matcher.isConsuming() && token.matchedRange.end > context.range.start)
      context.range.start = loopToken.offset = token.matchedRange.end;

    context.range.ensureBounds(loopRange);
  }

  updateLoopTokenRanges(scope, matcher, matcherResult) {
    this.updateCapturedRange(scope, matcher, matcherResult);
    this.updateMatchedRange(scope, matcher, matcherResult);
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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} stopping because matcher returned an empty result.`);

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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} stopping because an error is being passed upstream. Error: ${matcherResult.value.message}`);

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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} stopping because of a failure.`);

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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} stopping because of a halt request.`);

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
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking!`);
      result = result.payload; // Finalized token
    } else if (matcherResult.value === matcherName) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking because of a "break" request.`);
      result = result.payload; // Finalized token
    } else {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking because a "break" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
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
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing!`);
      result = result.payload; // Finalized token
    } else if (matcherResult.value === matcherName) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing because of a "continue" request.`);
      result = result.payload; // Finalized token
    } else {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing because a "continue" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
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
      loopToken,
      matcherName,
    } = scope;

    let token = matcherResult.value;

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Adding captured token.`, token);

    this.updateLoopTokenRanges(scope, matcher, matcherResult);

    token.parent = loopToken;
    loopToken.children.push(token);

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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Adding captured tokens (proxy children).`, token);

    this.updateLoopTokenRanges(scope, matcher, matcherResult);

    for (let child of token.children.values())
      this[MatcherResult.RESULT_TOKEN](scope, matcher, new MatcherResult(MatcherResult.RESULT_TOKEN, child));

    return this.createProcessResponse(
      scope,
      PROCESS_CODE_NEXT,
    );
  }

  [MatcherResult.RESULT_SKIP](scope, matcher, matcherResult) {
    let {
      context,
      loopToken,
      matcherName,
    } = scope;

    let skipAmount            = matcherResult.value || 0;
    let newStart              = context.range.start + skipAmount;
    let matcherResultOptions  = (typeof matcherResult.getOptions === 'function') ? matcherResult.getOptions() : {};

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Skipping by ${this.debugColor(context, 'bg:cyan')}${skipAmount}${this.debugColor(context, 'bg:black')} to new offset ${this.debugColor(context, 'bg:cyan')}${newStart}${this.debugColor(context, 'bg:black')}.`);

    if (newStart > loopToken.matchedRange.end)
      loopToken.matchedRange.end = newStart;

    if (matcherResultOptions.capturedRange)
      this.updateCapturedRange(scope, matcher, { value: matcherResultOptions });

    context.range.start = loopToken.offset = newStart;

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT);
  }

  [MatcherResult.RESULT_SEEK](scope, matcher, matcherResult) {
    let {
      context,
      loopToken,
      matcherName,
    } = scope;

    let range = matcherResult.value || 0;

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Seeking to new range ${this.debugColor(context, 'bg:cyan')}${range}${this.debugColor(context, 'bg:black')}.`);

    loopToken.matchedRange = range.clone();
    context.range = range.clone();

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT);
  }

  processMatcherResult(scope, matcher, matcherResult) {
    return this[matcherResult.type](scope, matcher, matcherResult);
  }

  finalizeToken(scope) {
    let {
      context,
      loopToken,
      matcherName,
      start,
      typeName,
    } = scope;

    if (loopToken.matchedRange.end === start && loopToken.children.length === 0)
      return;

    let source  = context.getSource();
    let value   = source.substring(loopToken.capturedRange.start, loopToken.capturedRange.end);

    loopToken.matchedValue = source.substring(loopToken.matchedRange.start, loopToken.matchedRange.end);
    loopToken.capturedValue = value;
    loopToken.value = value;
    loopToken.context = context.cloneWithRange(loopToken.matchedRange);

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} success ${this.debugColor(context, 'bg:cyan')}@${loopToken.matchedRange.start}-${loopToken.matchedRange.end}${this.debugColor(context, 'bg:black')}: [${this.debugValue(context, loopToken.matchedValue)}]`, loopToken);

    return new MatcherResult(
      MatcherResult.RESULT_TOKEN,
      loopToken,
    );
  }

  async executeMatcher(scope, matcher) {
    let {
      context,
      matcherName,
    } = scope;

    if (!(matcher instanceof Matcher))
      this.throwError(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    let matcherResult = await matcher.run(context);
    return this.processMatcherResult(scope, matcher, matcherResult || EMPTY_RESULT);
  }

  async executeMatchers(scope) {
    let {
      context,
      end,
      loopToken,
      matcherName,
      matchers,
      typeName,
    } = scope;

    let result;

    for (let matcher of matchers) {
      let resolvedMatcher = this.resolveValue(context, matcher, { wantPrimitiveValue: false });
      if (!(resolvedMatcher instanceof Matcher) && matcher instanceof Matcher)
        resolvedMatcher = matcher;

      if (loopToken.offset >= end && resolvedMatcher.isConsuming()) {
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
        return this.createProcessResponse(scope, PROCESS_CODE_BREAK, (result && result.result));
      }

      result = await this.executeMatcher(scope, resolvedMatcher);
      if (result.processCode !== PROCESS_CODE_NEXT)
        return result;
    }

    return this.createProcessResponse(scope, PROCESS_CODE_NEXT, (result && result.result));
  }

  async exec(context) {
    let matchers    = Array.from(this.matchers.values()).filter(Boolean);
    let start       = context.range.start;
    let end         = context.range.end;
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let typeName    = ('' + this.constructor.name);
    let loopToken   = new Token(context, {
      name:          matcherName,
      capturedRange: new SourceRange(start, start),
      matchedRange:  new SourceRange(start, start),
    });

    if (this.hasOwnScope()) {
      context.assignToScope({
        [matcherName]:  loopToken,
        '_':            loopToken,
      });
    }

    let startIndex  = parseFloat(this.resolveValue(context, this.startIndex, { wantPrimitiveValue: true, defaultValue: 0 }));
    let endIndex    = parseFloat(this.resolveValue(context, this.endIndex, { wantPrimitiveValue: true, defaultValue: Infinity }));
    let step        = parseFloat(this.resolveValue(context, this.step, { wantPrimitiveValue: true, defaultValue: 1 }));

    if (isNaN(startIndex))
      startIndex = 0;

    if (isNaN(endIndex))
      endIndex = startIndex;

    if (isNaN(step))
      step = 1;

    if (startIndex > endIndex)
      step = -1;

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Starting loop/iteration ${this.debugColor(context, 'bg:cyan')}@${start}-${context.range.end}${this.debugColor(context, 'bg:black')} [${this.debugPosition(context)}]: { startIndex: ${startIndex}, endIndex: ${endIndex} }`);

    if (!matchers.length) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} failed because no matchers were provided.`);
      return this.failResult(context);
    }

    let scope = {
      context,
      matchers,
      matcherName,
      typeName,
      loopToken,
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

      if (loopToken.offset >= end) {
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
        break;
      }

      let {
        result,
        processCode,
      } = await this.executeMatchers(scope);

      if (processCode === PROCESS_CODE_NEXT || processCode === PROCESS_CODE_RESTART) {
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} iterator incrementing from ${index} to ${index + step}!`);
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
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
      return this.failResult(context);
    }

    return finalToken;
  }
}

// Make static members non-enumberable
Object.keys(LoopMatcher).forEach((staticPropertyName) => {
  Object.defineProperties(LoopMatcher, {
    [staticPropertyName]: {
      writable:     false,
      enumerable:   false,
      configurable: true,
      value:        LoopMatcher[staticPropertyName],
    },
  });
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
