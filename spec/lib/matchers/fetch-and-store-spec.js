/* eslint-disable no-magic-numbers */

import { snapshot } from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Fetch,
  Store,
  Switch,
} = Matchers;

describe('Fetch and Store', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Testing Testing' });
  });

  it('works', async () => {
    let result = await parser.tokenize(
      Program('Program',
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals('First', Fetch('Value'))),
        Equals('Space', ' '),
        Equals('Second', Fetch('CapturedValue')),
      ),
    );

    expect(snapshot(result)).toBe('8777cd8588aa92513c85f31bb2f760fb');
  });

  it('works with tokens', async () => {
    parser = new Parser({ source: 'Testing Derp' });

    let result = await parser.tokenize(
      Program('Program',
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals('First', Fetch('Value'))),
        Fetch('CapturedValue'),
      ),
    );

    expect(snapshot(result)).toBe('c43092e85460fe5f3cd0cc5cca87ef1e');
  });

  it('works with current scope', async () => {
    let result = await parser.tokenize(
      Program('Program',
        Switch(Fetch('_')),
      ),
    );

    expect(snapshot(result)).toBe('d0264f86745aa20804ba5f465e113615');
  });
});
