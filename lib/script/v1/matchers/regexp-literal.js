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
  Pin,
  Program,
  Register,
  Switch,
} from '../../../matchers/index.js';

const MAP_ESCAPED_CHARACTER = ({ result, token }) => {
  if (token) {
    token.capturedRange.start++;
    token.capturedValue = token.value = token.value.substring(1);
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
      Register('CharacterAtom',
        Program('CharacterAtom',
          Switch(
            Map(
              Matches('CharacterLiteral', /\\./),
              MAP_ESCAPED_CHARACTER,
            ),
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
          Map(
            Matches('CharacterLiteral', /\\./),
            MAP_ESCAPED_CHARACTER,
          ),
          Matches('CharacterLiteral', /[^\]]/),
        ),
      ),
      Register('CharacterClass',
        Map(
          Program('CharacterClass',
            Discard(Equals('CharacterClassStart', '[')),
            Optional(Equals('Invert', '^')),
            Loop('Characters',
              Switch(
                Program('CharacterRange',
                  Call('CharacterLiteral', 'CharacterClassCharacterLiteral'),
                  Discard(Equals('-')),
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
          ({ result, token }) => {
            if (token) {
              // Enclose last discarded "]" and end of character group
              token.capturedRange.end++;
            }

            return result;
          },
        ),
      ),
      // Start RegExp match
      Discard(Equals('/')),
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
      Discard(Equals('/')),
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
