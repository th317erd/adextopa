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
      Register('RepeatingSpecifier',
        Switch(
          Matches('RepeatZeroOrMore', /\*/),
          Matches('RepeatOneOrMore', /\+/),
        ),
      ),
      Register('Character',
        Program('Character',
          Switch(
            Map(
              Matches('Character', /\\./),
              MAP_ESCAPED_CHARACTER,
            ),
            Matches('Character', /./),
          ),
          Optional(
            Call('RepeatingSpecifier'),
          ),
        ),
      ),
      Register('CharacterGroupCharacter',
        Switch(
          Map(
            Matches('Character', /\\./),
            MAP_ESCAPED_CHARACTER,
          ),
          Matches('Character', /[^\]]/),
        ),
      ),
      Register('CharacterGroup',
        Map(
          Program('CharacterGroup',
            Discard(Equals('CharacterGroupStart', '[')),
            Optional(Equals('Invert', '^')),
            Loop('Characters',
              Switch(
                Program('CharacterRange',
                  Call('Character', 'CharacterGroupCharacter'),
                  Discard(Equals('-')),
                  Call('Character', 'CharacterGroupCharacter'),
                ),
                Call('Character', 'CharacterGroupCharacter'),
              ),
            ),
            Discard(Equals('CharacterGroupEnd', ']')),
          ),
          ({ result, token }) => {
            if (token)
              token.capturedRange.end++;

            return result;
          },
        ),
      ),
      Discard(Equals('/')),
      Loop('Pattern',
        Switch(
          Pin(Program(Equals('/'), Break('Pattern'))),
          AssertIf('Nothing to repeat', Call('RepeatingSpecifier')),
          Call('CharacterGroup'),
          Call('Character'),
        ),
      ),
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
