import { Matcher } from '../../../matcher.js';

import {
  Break,
  Call,
  Discard,
  Equals,
  If,
  Loop,
  MapResult,
  Matches,
  Optional,
  Panic,
  Pin,
  Program,
  Register,
  Skip,
  Switch,
} from '../../../matchers/index.js';

function generateTokenForSpecialEscapedCharacterLiteral(scope, result) {
  let specialMap = {
    's': (inverted) => {
      return token.clone({
        attributes: {
          name:   'WhitespaceSequence',
          value:  token.value(),
          inverted,
        },
      });
    },
    'w': (inverted) => {
      return token.clone({
        attributes: {
          name: 'WordSequence',
          inverted,
        },
      });
    },
    'd': (inverted) => {
      return token.clone({
        attributes: {
          name: 'NumericSequence',
          inverted,
        },
      });
    },
    'b': (inverted) => {
      return token.clone({
        attributes: {
          name: 'WordBoundarySequence',
          inverted,
        },
      });
    },
  };

  let {
    context,
  } = scope;

  let {
    token,
  } = result;

  let character = token.value().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(specialMap, character))
    return result;

  return context.tokenResult(
    specialMap[character]((/^[A-Z]$/).test(token.value())),
    result,
  );
}

const MAP_ESCAPED_CHARACTER = (scope, result) => {
  let {
    token,
  } = result;

  if (token) {
    token.capturedRange.start++;
    token.value(token.value().substring(1));

    return generateTokenForSpecialEscapedCharacterLiteral(scope, result);
  }

  return result;
};

export const RegExpLiteral = Matcher.createMatcherMethod((_, name) => {
  return MapResult(
    Program(
      Register('Quantifier',
        Switch(
          Matches(/\*/).name('RepeatZeroOrMore'),
          Matches(/\+/).name('RepeatOneOrMore'),
        ),
      ),
      Register('EscapedCharacterLiteral',
        MapResult(
          Matches(/\\./).name('CharacterLiteral'),
          MAP_ESCAPED_CHARACTER,
        ),
      ),
      Register('CharacterAtom',
        Program(
          Switch(
            Call('EscapedCharacterLiteral').name('CharacterLiteral'),
            Matches(/\./).name('Wildcard'),
            Matches(/./).name('CharacterLiteral'),
          ),
          Optional(
            Call('Quantifier'),
          ),
        ).name('CharacterAtom'),
      ),
      Register('CharacterClassCharacterLiteral',
        Switch(
          Call('EscapedCharacterLiteral').name('CharacterLiteral'),
          Matches(/[^\]]/).name('CharacterLiteral'),
        ),
      ),
      Register('CharacterClass',
        Program(
          Discard(Equals('[').name('CharacterClassStart')),
          Optional(Equals('^').name('Invert')),
          Loop(
            Switch(
              Program(
                Call('CharacterClassCharacterLiteral').name('CharacterLiteral'),
                Discard(Equals('-')),
                Call('CharacterClassCharacterLiteral').name('CharacterLiteral'),
              ).name('CharacterRange'),
              Call('CharacterClassCharacterLiteral').name('CharacterLiteral'),
            ),
          ).name('Characters'),
          Discard(Equals(']').name('CharacterClassEnd')),
          Optional(
            Call('Quantifier'),
          ),
        ).name('CharacterClass'),
      ),
      // Start RegExp match
      Skip(Equals('/')),
      Optional(Matches(/\^/).name('StartOfInputAssertion')),
      Loop(
        Switch(
          // If this is the next thing, then we are done, break
          Pin(Discard(Program(Matches(/[/$]/), Break('Pattern')))),
          // Ensure we aren't repeating anything that
          // hasn't been specified yet (i.e. /*/)
          If(
            Call('Quantifier'),
            Panic('Nothing to repeat'),
          ),
          Call('CharacterClass'),
          Call('CharacterAtom'),
        ),
      ).name('Pattern'),
      Optional(Matches(/\$/).name('EndOfInputAssertion')),
      // Complete RegExp match
      Skip(Equals('/')),
      Pin(
        Optional(
          MapResult(
            Loop(
              Switch(
                Matches(/[dgimsuvy]/).name('Flag'),
                // If we get here, then this is an unknown flag
                Panic(({ context }) => {
                  let badFlag = context.getInputStream().slice(context.parserRange.start, context.parserRange.start + 1);
                  throw SyntaxError(`Unknown RegExp flag "${badFlag}"`);
                }),
              ),
            ).name('Flags'),
            (_, { token }) => {
              if (!token)
                return;

              let tokenValue = token.capturedValue;

              // Ensure only supported flags
              if ((/[^dgimsuvy]/).test(tokenValue))
                throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${tokenValue}'`);

              // Ensure no flag is repeated more than once
              if ((/d{2,}|g{2,}|i{2,}|m{2,}|s{2,}|u{2,}|v{2,}|y{2,}/).test(tokenValue))
                throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${tokenValue}'`);

              // "u" and "v" can not go together
              if ((/u.*v|v.*u/).test(tokenValue))
                throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${tokenValue}'`);
            },
          ),
        ),
      ),
    ).name(name || 'RegExpLiteral'),
    (_, { token }) => {
      if (!token)
        return;

      let flags;
      let lastChild = token.children[token.children.length - 1];
      if (lastChild && lastChild.name() === 'Flags')
        flags = lastChild.capturedValue;

      // Turn the result into a RegExp instance
      token.value(new RegExp(token.capturedValue, flags));
    },
  );
});
