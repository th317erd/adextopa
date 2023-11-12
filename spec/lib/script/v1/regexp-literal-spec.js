/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      RegExpLiteral,
    },
  },
} = Script;

const FAIL = 'ec849c2b4452f1c7538f193a18f1d244';

fdescribe('/Script/V1/RegExpLiteral', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });

      try {
        return snapshot(await parser.tokenize(RegExpLiteral(), false), debug);
      } catch (error) {
        return snapshot(error, debug);
      }
    };

    expect(await test('/+cat+/')).toBe('85df227ff4dce80ad2e611c88b66ab91');
    expect(await test('/cat+*/')).toBe('831bf5921b9b5dcc824a4f13f3d96d03');
    expect(await test('/cat+/')).toBe('1de2758a27b2b29ae421592107556041');
    expect(await test('/cat*/')).toBe('573467792690e0eb8b0dd95319235b6c');
    expect(await test('/cat[abc]/')).toBe('54857cdc598e1e30476ab00cfac1aabf');
    expect(await test('/cat[abcA-Z]/')).toBe('2cb58ce6fb78cc0290322db9f22c2c8c');
    expect(await test('/[a-zA-Z-]/')).toBe('c0bef20a22c9f5197bba34df282a028b');
    expect(await test('/[^a-z]/')).toBe('4ad55d09816e7f692995722bda6c511f');
    expect(await test('/[^\\[-\\]\\]-]/')).toBe('17a9c55f6e009ac3be420f74d68866bc');
    // expect(await test('//')).toBe(FAIL);
  });
});
