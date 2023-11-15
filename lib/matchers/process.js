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

  static TokenMatcherResult = class ProcessTokenMatcherResult extends TokenMatcherResult {
    async finalizeProcess(scope, result) {
      let {
        matcher,
        processToken,
        parserRange,
      } = scope;

      let token = result.value;
      processToken.capturedRange.expandTo(token.capturedRange).clampTo(parserRange);
      processToken.matchedRange.expandTo(token.matchedRange).clampTo(parserRange);

      return await matcher.nextMatcher.call(matcher, scope);
    }
  };

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

  // updateFromTokenRanges({ processToken, start, end }, matcher, matcherResult) {
  //   let token     = matcherResult.value;
  //   let loopRange = { start, end };

  //   if (!processToken._firstCaptureRangeProcessed) {
  //     Object.defineProperties(processToken, {
  //       '_firstCaptureRangeProcessed': {
  //         writable:     true,
  //         enumerable:   false,
  //         configurable: true,
  //         value:        true,
  //       },
  //     });

  //     processToken.capturedRange.start = token.capturedRange.start;
  //   }

  //   if (token.capturedRange.end > processToken.capturedRange.end)
  //     processToken.capturedRange.end = token.capturedRange.end;

  //   if (token.capturedRange.end > processToken.matchedRange.end)
  //     processToken.matchedRange.end = token.capturedRange.end;

  //   processToken.capturedRange.ensureBounds(loopRange);
  //   processToken.matchedRange.ensureBounds(loopRange);
  // }

  // updateContextRange({ context, processToken, start, end }, matcher, matcherResult) {
  //   let token       = matcherResult.value;
  //   let loopRange   = { start, end };

  //   // Only update the parsing range if the matcher is a consuming matcher
  //   if (matcher.isConsuming() && token.parserRange.end > context.parserRange.start)
  //     context.parserRange.start = processToken.offset = token.parserRange.end;

  //   context.parserRange.ensureBounds(loopRange);
  // }

  // updateLoopTokenRanges(processScope, matcher, matcherResult) {
  //   this.updateFromTokenRanges(processScope, matcher, matcherResult);
  //   this.updateContextRange(processScope, matcher, matcherResult);
  // }

  // createProcessResponse(_scope, processCode, result) {
  //   return {
  //     processCode,
  //     result,
  //   };
  // }

  // processMatcherResultPayload(processScope, matcher, _matcherResult) {
  //   let matcherResult = _matcherResult;
  //   if (matcherResult && matcherResult.payload)
  //     this.processMatcherResult(processScope, matcher, matcherResult.payload);

  //   return MatcherResult.cloneMatcherResult(matcherResult, {
  //     payload: this.finalizeToken(processScope),
  //   });
  // }

  // [MatcherResult.RESULT_EMPTY](processScope, _matcher) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because matcher returned an empty result.`);

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_BREAK,
  //     context.failResult(),
  //   );
  // }

  // [MatcherResult.RESULT_PANIC](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because an error is being passed upstream. Error: ${matcherResult.value.message}`);

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_BREAK,
  //     this.processMatcherResultPayload(processScope, matcher, matcherResult),
  //   );
  // }

  // [MatcherResult.RESULT_FAIL](processScope, _matcher, _matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because of a failure.`);

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_BREAK,
  //     this.finalizeToken(processScope),
  //   );
  // }

  // [MatcherResult.RESULT_HALT](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because of a halt request.`);

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_BREAK,
  //     this.processMatcherResultPayload(processScope, matcher, matcherResult),
  //   );
  // }

  // [MatcherResult.RESULT_BREAK](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   let result = this.processMatcherResultPayload(processScope, matcher, matcherResult);

  //   if (!matcherResult.value) {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking!`);
  //     result = result.payload; // Finalized token
  //   } else if (matcherResult.value === matcherName) {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking because of a "break" request.`);
  //     result = result.payload; // Finalized token
  //   } else {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking because a "break" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
  //   }

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_BREAK,
  //     result,
  //   );
  // }

  // [MatcherResult.RESULT_CONTINUE](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   let result = this.processMatcherResultPayload(processScope, matcher, matcherResult);

  //   if (!matcherResult.value) {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing!`);
  //     result = result.payload; // Finalized token
  //   } else if (matcherResult.value === matcherName) {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing because of a "continue" request.`);
  //     result = result.payload; // Finalized token
  //   } else {
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing because a "continue" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);
  //   }

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_RESTART,
  //     result,
  //   );
  // }

  // [MatcherResult.RESULT_TOKEN](processScope, matcher, matcherResult) {
  //   if (matcherResult.value.isProxy())
  //     return this.processProxyToken(processScope, matcher, matcherResult);
  //   else
  //     return this.processToken(processScope, matcher, matcherResult);
  // }

  // processToken(processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     processToken,
  //     matcherName,
  //   } = processScope;

  //   let token = matcherResult.value;

  //   if (!matcher.skipLogging('token', 'Loop:RESULT_TOKEN'))
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Adding captured token.`, token);

  //   this.updateLoopTokenRanges(processScope, matcher, matcherResult);

  //   token.parent = processToken;
  //   processToken.children.push(token);

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_NEXT,
  //   );
  // }

  // processProxyToken(processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     matcherName,
  //   } = processScope;

  //   let token = matcherResult.value;

  //   if (!matcher.skipLogging('proxyChildren', 'Loop:RESULT_PROXY_TOKEN', 'Loop:RESULT_TOKEN'))
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Adding captured tokens (proxy children).`, token);

  //   this.updateLoopTokenRanges(processScope, matcher, matcherResult);

  //   for (let child of token.children.values())
  //     this[MatcherResult.RESULT_TOKEN](processScope, matcher, context.tokenResult(child));

  //   return this.createProcessResponse(
  //     processScope,
  //     PROCESS_CODE_NEXT,
  //   );
  // }

  // [MatcherResult.RESULT_SKIP](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     processToken,
  //     matcherName,
  //   } = processScope;

  //   let skipAmount            = matcherResult.value || 0;
  //   let newStart              = context.parserRange.start + skipAmount;
  //   let matcherResultOptions  = (typeof matcherResult.getOptions === 'function') ? matcherResult.getOptions() : {};

  //   if (!matcher.skipLogging('skip', 'Loop:RESULT_SKIP'))
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Skipping by ${context.debugColor('bg:cyan')}${skipAmount}${context.debugColor('bg:black')} to new offset ${context.debugColor('bg:cyan')}${newStart}${context.debugColor('bg:black')}.`);

  //   if (newStart > processToken.matchedRange.end)
  //     processToken.matchedRange.end = newStart;

  //   if (matcherResultOptions.capturedRange)
  //     this.updateFromTokenRanges(processScope, matcher, { value: matcherResultOptions });

  //   context.parserRange.start = processToken.offset = newStart;

  //   return this.createProcessResponse(processScope, PROCESS_CODE_NEXT);
  // }

  // [MatcherResult.RESULT_SEEK](processScope, matcher, matcherResult) {
  //   let {
  //     context,
  //     processToken,
  //     matcherName,
  //   } = processScope;

  //   let range = matcherResult.value || 0;

  //   if (!matcher.skipLogging('seek', 'Loop:RESULT_SEEK'))
  //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Seeking to new range ${context.debugColor('bg:cyan')}${range}${context.debugColor('bg:black')}.`);

  //   processToken.matchedRange = range.clone();
  //   context.range = range.clone();

  //   return this.createProcessResponse(processScope, PROCESS_CODE_NEXT);
  // }

  // processMatcherResult(processScope, matcher, matcherResult) {
  //   return this[matcherResult.type](processScope, matcher, matcherResult);
  // }

  isProcessSuccessful(processScope) {
    let {
      processToken,
      startOffset,
    } = processScope;

    if (processToken.matchedRange.end === startOffset && processToken.children.length === 0)
      return false;

    return true;
  }

  // finalizeToken(processScope) {
  //   if (!this.isProcessSuccessful(processScope))
  //     return;

  //   let {
  //     context,
  //     processToken,
  //     matcherName,
  //     typeName,
  //   } = processScope;

  //   let source  = context.getSource();
  //   let value   = source.substring(processToken.capturedRange.start, processToken.capturedRange.end);

  //   processToken.matchedValue = source.substring(processToken.matchedRange.start, processToken.matchedRange.end);
  //   processToken.capturedValue = value;
  //   processToken.value = value;
  //   processToken.context = context.cloneWithRange(processToken.matchedRange);

  //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

  //   return context.tokenResult(
  //     processToken,
  //   );
  // }

  async executeMatcher(processScope, matcher) {
    let {
      context,
      matcherName,
    } = processScope;

    if (!(matcher instanceof Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    return await context.exec(matcher);
  }

  // ----------------------------------------------

  addChild(processScope, matcherResult, token) {
    this.processToken.addChild(token);
  }

  processScopeAssign(processScope, options) {
    let obj = Object.create(processScope);
    return Object.assign(obj, options || {});
  }

  async handleMatcherResult(processScope, _matcherResult) {
    let matcherResult = processScope.context.cloneToCustomMatcherResult(this, _matcherResult);
    return await matcherResult.process(processScope);
  }

  async nextMatcher(processScope) {
    let {
      currentMatcherIndex,
    } = processScope;

    return await this.processMatcher(this.processScopeAssign(processScope, { currentMatcherIndex: currentMatcherIndex + 1 }));
  }

  async processMatcher(processScope) {
    let {
      context,
      currentMatcherIndex,
      endOffset,
      matcherName,
      matchers,
      processToken,
      typeName,
    } = processScope;

    if (currentMatcherIndex >= matchers.length)
      return await this.nextIteration(processScope);

    let currentMatcher  = matchers[currentMatcherIndex];
    let resolvedMatcher = context.resolveValue(currentMatcher);
    if (!Utils.isType(resolvedMatcher, Matcher) && Utils.isType(currentMatcher, Matcher))
      resolvedMatcher = currentMatcher;

    if (!Utils.isType(resolvedMatcher, Matcher))
      context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Each matcher must be a matcher.`);

    if (processToken.offset >= endOffset && resolvedMatcher.isConsuming()) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
      return;
    }

    let matcherResult = await this.executeMatcher(processScope, resolvedMatcher);
    return await this.handleMatcherResult(processScope, matcherResult);
  }

  async nextIteration(processScope) {
    let {
      currentIterationIndex,
      step,
    } = processScope;

    return await this.processIteration(this.processScopeAssign(processScope, { currentIterationIndex: currentIterationIndex + step }));
  }

  async processIteration(processScope) {
    let {
      currentIterationIndex,
      endIndex,
      startIndex,
    } = processScope;

    if (startIndex === endIndex)
      return;

    if (startIndex < endIndex && currentIterationIndex >= endIndex)
      return;

    if (startIndex > endIndex && currentIterationIndex <= startIndex)
      return;

    return await this.processMatcher(this.processScopeAssign(processScope, { currentMatcherIndex: 0 }));
  }

  async exec(context) {
    let matchers      = this.matchers;
    let startOffset   = context.parserRange.start;
    let endOffset     = context.parserRange.end;
    let parserRange   = new SourceRange(startOffset, endOffset);
    let matcherName   = ('' + context.resolvePrimitive(this.name));
    let typeName      = ('' + this.constructor.name);
    let processToken  = this.processToken = new Token(context, {
      name:          matcherName,
      capturedRange: new SourceRange(startOffset, startOffset),
      matchedRange:  new SourceRange(startOffset, startOffset),
    });

    if (this.hasOwnScope()) {
      context.assign({
        [matcherName]:  processToken,
        '_':            processToken,
      });
    }

    let startIndex  = parseFloat(context.resolvePrimitive(this.startIndex, { defaultValue: 0 }));
    let endIndex    = parseFloat(context.resolvePrimitive(this.endIndex, { defaultValue: Infinity }));
    let step        = parseFloat(context.resolvePrimitive(this.step, { defaultValue: 1 }));

    if (isNaN(startIndex))
      startIndex = 0;

    if (isNaN(endIndex))
      endIndex = startIndex;

    if (isNaN(step))
      step = 1;

    if (startIndex > endIndex)
      step = -1;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Starting iteration ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.end}${context.debugColor('bg:black')} [${context.debugPosition()}]: { startIndex: ${startIndex}, endIndex: ${endIndex} }`);

    if (!matchers.length) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because no matchers were provided.`);
      return context.failResult();
    }

    let processScope = {
      currentIterationIndex:  startIndex,
      currentMatcherIndex:    0,
      matcher:                this,
      context,
      matcherName,
      matchers,
      processToken,
      typeName,
      startOffset,
      endOffset,
      parserRange,
      startIndex,
      endIndex,
      step,
    };

    // for (let index = startIndex; ;) {
    //   if (startIndex < endIndex && index >= endIndex) {
    //     processScope['break']();
    //     break;
    //   } else if (startIndex > endIndex && index <= startIndex) {
    //     processScope['break']();
    //     break;
    //   } else if (startIndex === endIndex) {
    //     processScope['break']();
    //     break;
    //   }

    //   if (processToken.offset >= endOffset) {
    //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} ceasing because end of input reached.`);
    //     processScope['break']();
    //     break;
    //   }

    //   await this.executeMatchers(processScope);

    //   if (processCode === PROCESS_CODE_NEXT || processCode === PROCESS_CODE_RESTART) {
    //     context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} iterator incrementing from ${index} to ${index + step}!`);
    //     index += step;

    //     continue;
    //   }

    //   if (processCode === PROCESS_CODE_BREAK) {
    //     if (result)
    //       return result;

    //     break;
    //   }
    // }

    await this.processIteration(processScope);

    if (!this.isProcessSuccessful(processScope)) {
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
