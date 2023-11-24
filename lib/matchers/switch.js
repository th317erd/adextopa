import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

export const SwitchMatcher = Utils.makeKeysNonEnumerable(class SwitchMatcher extends ProcessMatcher {
  static name = 'Switch';

  static hasOwnScope() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};

    super({
      ...options,
      attributes: Utils.assign({}, options.attributes, {
        start:  0,
        end:    1,
        step:   1,
      }),
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      currentOffset: context.parserRange.start,
    };
  }

  // For "Switch" we skip to next matcher
  // on Failure, instead of aborting
  async handleMatcherResult(matcherScope, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
      startOffset,
      currentOffset,
    } = matcherScope;

    // First, handle important messages
    if (matcherResult.panic) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because of a panic! Passing "panic" upstream...`);
      return matcherResult;
    } else if (matcherResult.failed) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} matcher failed! Attempting next matcher...`);

      // Apply the result to "processToken"
      await this.applyMatcherResult(matcherScope, matcherResult);

      return await this.nextMatcher(this.processScopeAssign(matcherScope, { currentOffset: context.parserRange.start, matcherScope }));
    } else if (matcherResult.halt) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "halt" request received! Passing "halt" upstream...`);
    }

    // Apply the result to "processToken"
    await this.applyMatcherResult(matcherScope, matcherResult);

    // Handle break and continue
    if (matcherResult.break != null || matcherResult.continue != null) {
      let opName = (matcherResult.break != null) ? 'break' : 'continue';
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} "${opName}" request received! Passing "${opName}" upstream...`);
      return matcherResult;
    }

    // Handle non-token results (i.e. from a Fetch)
    if (matcherResult.value != null)
      return matcherResult;

    if (context.parserRange.start === currentOffset) {
      // We skipped by 0, so continue
      return await this.nextMatcher(matcherScope, ({ context, matcherName, processToken }) => {
        if (processToken.children.length === 0 && context.parserRange.start === startOffset) {
          // We hit the end, and nothing happened... fail!
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because nothing was consumed.`);
          return context.failResult();
        }

        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${processToken.matchedRange.start}-${processToken.matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(processToken.matchedValue)}]`, processToken);

        return context.updateParserOffsetResult(context.parserRange.start, matcherResult);
      });
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} success ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.start}${context.debugColor('bg:black')}: `, matcherResult);

    return matcherResult;
  }
});

export const Switch = Matcher.createMatcherMethod((_, ...matchers) => {
  return new SwitchMatcher({
    matchers: matchers.map(stringToFetch).filter(Boolean),
  });
});
