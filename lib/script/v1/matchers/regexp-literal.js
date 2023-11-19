import {
  AssertIf,
  Break,
  Call,
  Discard,
  Equals,
  Loop,
  Map,
  Matches,
  Optional,
  Panic,
  Pin,
  Program,
  Register,
  Skip,
  Switch,
} from '../../../matchers/index.js';

function generateTokenForSpecialEscapedCharacterLiteral(scope) {
  let specialMap = {
    's': (inverted, { context, token }) => {
      return token.clone(context, {
        name: 'WhitespaceSequence',
        inverted,
      });
    },
    'w': (inverted, { context, token }) => {
      return token.clone(context, {
        name: 'WordSequence',
        inverted,
      });
    },
    'd': (inverted, { context, token }) => {
      return token.clone(context, {
        name: 'NumericSequence',
        inverted,
      });
    },
    'b': (inverted, { context, token }) => {
      return token.clone(context, {
        name: 'WordBoundarySequence',
        inverted,
      });
    },
  };

  let {
    self,
    context,
    token,
    result,
  } = scope;

  let character = token.value.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(specialMap, character))
    return result;

  return self.tokenResult(
    context,
    specialMap[character]((/^[A-Z]$/).test(token.value), scope),
  );
}

const MAP_ESCAPED_CHARACTER = (scope) => {
  let {
    token,
    result,
  } = scope;

  if (token) {
    token.capturedRange.start++;
    token.capturedValue = token.value = token.value.substring(1);

    return generateTokenForSpecialEscapedCharacterLiteral(scope);
  }

  return result;
};

export function RegExpLiteral(name) {
  return Map(
    Program(
      Register('Quantifier',
        Switch(
          Matches(/\*/).name('RepeatZeroOrMore'),
          Matches(/\+/).name('RepeatOneOrMore'),
        ),
      ),
      Register('EscapedCharacterLiteral',
        Map(
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
          Pin(Program(Matches(/[/$]/), Break('Pattern'))),
          // Ensure we aren't repeating anything that
          // hasn't been specified yet (i.e. /*/)
          AssertIf('Nothing to repeat', Call('Quantifier')),
          Call('CharacterClass'),
          Call('CharacterAtom'),
        ),
      ).name('Pattern'),
      Optional(Matches(/\$/).name('EndOfInputAssertion')),
      // Complete RegExp match
      Skip(Equals('/')),
      Optional(
        Map(
          Loop(
            Switch(
              Matches(/[dgimsuvy]/).name('Flag'),
              // If we get here, then this is an unknown flag
              Panic(({ context }) => {
                let badFlag = context.getSource().substring(context.parserRange.start, context.parserRange.start + 1);
                throw SyntaxError(`Unknown RegExp flag "${badFlag}"`);
              }),
            ),
          ).name('Flags'),
          ({ result, token }) => {
            if (!token)
              return result;

            // Ensure only supported flags
            if ((/[^dgimsuvy]/).test(token.value))
              throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${token.value}'`);

            // Ensure no flag is repeated more than once
            if ((/d{2,}|g{2,}|i{2,}|m{2,}|s{2,}|u{2,}|v{2,}|y{2,}/).test(token.value))
              throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${token.value}'`);

            // "u" and "v" can not go together
            if ((/u.*v|v.*u/).test(token.value))
              throw new SyntaxError(`Invalid flags supplied to RegExp constructor '${token.value}'`);

            return result;
          },
        ),
      ),
    ).name(name || 'RegExpLiteral'),
    ({ result, token }) => {
      if (!token)
        return result;

      let flags;
      let lastChild = token.children[token.children.length - 1];
      if (lastChild && lastChild.name === 'Flags')
        flags = lastChild.value;

      // Turn the result into a RegExp instance
      token.value = new RegExp(token.value, flags);

      return result;
    },
  );
}
