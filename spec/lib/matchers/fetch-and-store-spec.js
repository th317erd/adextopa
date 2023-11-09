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

    expect(snapshot(result)).toBe('49a9b09a6ebb8f5d6d6092f2d0be5080');
  });

  // it('works with tokens', async () => {
  //   parser = new Parser({ source: 'Testing Derp' });

  //   let result = await parser.tokenize(
  //     Program('Program',
  //       Store('Value', 'Testing'),
  //       Store('CapturedValue', Equals('First', Fetch('Value'))),
  //       Fetch('CapturedValue'),
  //     ),
  //   );

  //   expect(snapshot(result, true)).toBe('49a9b09a6ebb8f5d6d6092f2d0be5080');
  // });
});