import {
  AssertIf,
  Break,
  Call,
  Skip,
  Equals,
  Loop,
  Map,
  Matches,
  Discard,
  Optional,
  Pin,
  Program,
  Register,
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
    Program(name || 'RegExpLiteral',
      Register('Quantifier',
        Switch(
          Matches('RepeatZeroOrMore', /\*/),
          Matches('RepeatOneOrMore', /\+/),
        ),
      ),
      Register('EscapedCharacterLiteral',
        Map(
          Matches('CharacterLiteral', /\\./),
          MAP_ESCAPED_CHARACTER,
        ),
      ),
      Register('CharacterAtom',
        Program('CharacterAtom',
          Switch(
            Call('CharacterLiteral', 'EscapedCharacterLiteral'),
            Matches('Wildcard', /\./),
            Matches('CharacterLiteral', /./),
          ),
          Optional(
            Call('Quantifier'),
          ),
        ),
      ),
      Register('CharacterClassCharacterLiteral',
        Switch(
          Call('CharacterLiteral', 'EscapedCharacterLiteral'),
          Matches('CharacterLiteral', /[^\]]/),
        ),
      ),
      Register('CharacterClass',
        Program('CharacterClass',
          Discard(Equals('CharacterClassStart', '[')),
          Optional(Equals('Invert', '^')),
          Loop('Characters',
            Switch(
              Program('CharacterRange',
                Call('CharacterLiteral', 'CharacterClassCharacterLiteral'),
                Skip(Equals('-')),
                Call('CharacterLiteral', 'CharacterClassCharacterLiteral'),
              ),
              Call('CharacterLiteral', 'CharacterClassCharacterLiteral'),
            ),
          ),
          Discard(Equals('CharacterClassEnd', ']')),
          Optional(
            Call('Quantifier'),
          ),
        ),
      ),
      // Start RegExp match
      Skip(Equals('/')),
      Optional(Matches('StartOfInputAssertion', /\^/)),
      Loop('Pattern',
        Switch(
          // If this is the next thing, then we are done, break
          Pin(Program(Matches(/[/$]/), Break('Pattern'))),
          // Ensure we aren't repeating anything that
          // hasn't been specified yet (i.e. /*/)
          AssertIf('Nothing to repeat', Call('Quantifier')),
          Call('CharacterClass'),
          Call('CharacterAtom'),
        ),
      ),
      Optional(Matches('EndOfInputAssertion', /\$/)),
      // Complete RegExp match
      Skip(Equals('/')),
    ),
    ({ result, token }) => {
      if (!token)
        return result;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value = new RegExp(token.value);

      return result;
    },
  );
}
