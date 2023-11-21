/* eslint-disable no-cond-assign */

import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const NotMatcher = Utils.makeKeysNonEnumerable(class NotMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'NotMatcher';

  static name = 'Not';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('NotMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
    });
  }

  processFailureResult(matcherScope, matcherResult) {
    const fail = (message, ...args) => {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${message}`, ...args);
      return context.failResult();
    };

    let {
      context,
      matcherName,
      startOffset,
      endOffset,
    } = matcherScope;

    let value;
    if (value = matcherResult.token)
      return fail('Failed because of successful resulting token: ', value);
    else if ((value = matcherResult.value) != null)
      return fail('Failed because of successful resulting value: ', value);
    else if (value = matcherResult.parserRange)
      return fail(`Failed because parser range would have been updated: ${context.debugColor('bg:cyan')}@${startOffset}-${endOffset}${context.debugColor('bg:black')} -> ${context.debugColor('bg:cyan')}@${value.start}-${value.end}${context.debugColor('bg:black')}`);
    else if (value = matcherResult.parserOffset && value !== startOffset)
      return fail(`Failed because parser offset would have been updated: ${context.debugColor('bg:cyan')}@${startOffset}-${endOffset}${context.debugColor('bg:black')} -> ${context.debugColor('bg:cyan')}@${startOffset + value}-${endOffset}${context.debugColor('bg:black')}`);
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValueToMatcher(this.matcher),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      matcher,
      startOffset,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let matcherResult = await context.exec(matcher);

    if (matcherResult.panic) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because a panic request was received. Passing "panic" upstream...`);
      return matcherResult;
    }

    let failureResult = this.processFailureResult(matcherScope, matcherResult);
    if (failureResult)
      return failureResult;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success! Provided matcher failed... passing result upstream...`);

    return context.updateParserOffsetResult(startOffset, matcherResult).setFailed(false);
  }
});

export const Not = Matcher.createMatcherMethod((matcher) => {
  return new NotMatcher({
    matcher: stringToFetch(matcher),
  });
});
