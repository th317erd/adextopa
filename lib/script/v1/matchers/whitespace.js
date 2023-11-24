import * as Utils   from '../../../utils.js';
import { Matcher }  from '../../../matcher.js';

import {
  Matches,
  Switch,
  Loop,
  Discard,
  ProxyChildren,
  Optional,
} from '../../../matchers/index.js';

import {
  LineComment,
  BlockComment,
} from './comment.js';

export const WhitespaceMatcher = Utils.makeKeysNonEnumerable(class WhitespaceMatcher extends Matcher {
  // static [Utils.TYPE_SYMBOL] = 'WhitespaceMatcher';

  static name = 'Whitespace';

  createMatcherScope(context) {
    let matcherScope      = super.createMatcherScope(context);
    let newlines          = context.resolveValueToBoolean(this.newlines(), { defaultValue: true });
    let lineComments      = context.resolveValueToBoolean(this.lineComments(), { defaultValue: true });
    let blockComments     = context.resolveValueToBoolean(this.blockComments(), { defaultValue: true });
    let discardWhitespace = context.resolveValueToBoolean(this.discardWhitespace(), { defaultValue: true });

    // Create list of matchers
    let matchers = ([
      !newlines && Matches(/[^\S\n\r]+/).name(matcherScope.matcherName),
      newlines && Matches(/\s+/).name(matcherScope.matcherName),
    ]).filter(Boolean);

    // Discard whitespace if requested
    if (discardWhitespace)
      matchers = matchers.map(Discard);

    // Don't discard comments
    matchers = matchers.concat([
      lineComments && LineComment(),
      blockComments && BlockComment(),
    ].filter(Boolean));

    let matcher = Optional(
      ProxyChildren(
        Loop(
          Switch(...matchers),
        ).name(matcherScope.matcherName),
      ),
    );

    return {
      ...matcherScope,
      newlines,
      lineComments,
      blockComments,
      discardWhitespace,
      matcher,
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcher,
    } = matcherScope;

    return await context.exec(matcher);
  }

  // Attribute accessors
  newlines(value) {
    if (arguments.length === 0)
      return this.getAttribute('newlines');

    this.setAttribute('newlines', value);

    return this;
  }

  lineComments(value) {
    if (arguments.length === 0)
      return this.getAttribute('lineComments');

    this.setAttribute('lineComments', value);

    return this;
  }

  blockComments(value) {
    if (arguments.length === 0)
      return this.getAttribute('blockComments');

    this.setAttribute('blockComments', value);

    return this;
  }

  discardWhitespace(value) {
    if (arguments.length === 0)
      return this.getAttribute('discardWhitespace');

    this.setAttribute('discardWhitespace', value);

    return this;
  }
});

// Whitespace, but not newlines, zero or more
export const Whitespace = Matcher.createMatcherMethod(() => {
  return new WhitespaceMatcher();
}, [ 'newlines', 'lineComments', 'blockComments', 'discardWhitespace' ]);

export const EMPTY = Whitespace()
  .newlines(true)
  .lineComments(true)
  .blockComments(true)
  .discardWhitespace(true);
