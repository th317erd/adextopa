/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      Literal,
    },
  },
} = Script;

const FAIL = 'ec849c2b4452f1c7538f193a18f1d244';

describe('/Script/V1/Literal', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return snapshot(await parser.tokenize(Literal(), debug), debug);
    };

    // Boolean
    expect(await test('true')).toBe('622726f946df1ca39c4bf473ef9c4039');
    expect(await test('true.')).toBe('622726f946df1ca39c4bf473ef9c4039');
    expect(await test('true+')).toBe('622726f946df1ca39c4bf473ef9c4039');
    expect(await test('true/')).toBe('622726f946df1ca39c4bf473ef9c4039');
    expect(await test('true ')).toBe('622726f946df1ca39c4bf473ef9c4039');
    expect(await test('false')).toBe('2632e80778af515a5a6cf5fa1445bc60');
    expect(await test('false.')).toBe('2632e80778af515a5a6cf5fa1445bc60');
    expect(await test('false+')).toBe('2632e80778af515a5a6cf5fa1445bc60');
    expect(await test('false/')).toBe('2632e80778af515a5a6cf5fa1445bc60');
    expect(await test('false ')).toBe('2632e80778af515a5a6cf5fa1445bc60');
    expect(await test('True')).toBe(FAIL);
    expect(await test('TRUE')).toBe(FAIL);
    expect(await test('False')).toBe(FAIL);
    expect(await test('FALSE')).toBe(FAIL);
    expect(await test('truey')).toBe(FAIL);
    expect(await test('true_')).toBe(FAIL);
    expect(await test('falsey')).toBe(FAIL);
    expect(await test('false_')).toBe(FAIL);

    // Number
    expect(await test('0.0')).toBe('3fb1640ffa4328f588c51b9a10727404');
    expect(await test('10.02')).toBe('6456afefd7d475ed2bb034e075f9aa5f');
    expect(await test('-0.0')).toBe('15dfed5c5ebf5ff2e006dd25693c55e1');
    expect(await test('-0.0+')).toBe('15dfed5c5ebf5ff2e006dd25693c55e1');
    expect(await test('-00.0001')).toBe('e357c24f8ec8dcf1112417587ac813da');
    expect(await test('+0.0')).toBe('ab41a9f2b5669af1e1439e181a1f65c0');
    expect(await test('+0.0-')).toBe('ab41a9f2b5669af1e1439e181a1f65c0');
    expect(await test('+42')).toBe('ab6be861f75a54650bac443185be2f06');
    expect(await test('-42')).toBe('12df0dc6c513dabb442eb62c1ed53389');
    expect(await test('-0')).toBe('cdcf5fb2fb896217051b1777c447f413');
    expect(await test('0')).toBe('7b8be916fe4137fa80f9daf0d6bb815d');
    expect(await test('105')).toBe('7614530e92e81b8fc92d5fc8d8123102');
    expect(await test('8.102916686331973e-11')).toBe('b8f7891dce603546ea21c5ed139fb83a');
    expect(await test('8.102916686331973e-1')).toBe('8a6a4605599303d82c62d6a7c755943d');
    expect(await test('8.0e-001')).toBe('11c39731f55d1e8ef68417755dd8b2b2');
    expect(await test('0.+0')).toBe(FAIL);
    expect(await test('0.-0')).toBe(FAIL);
    expect(await test('.0')).toBe(FAIL);
    expect(await test('0.')).toBe(FAIL);
    expect(await test('0.0e')).toBe(FAIL);
    expect(await test('0.0e-')).toBe(FAIL);

    // String
    expect(await test('\'derp\'')).toBe('840a2f511c8d909682b8360be7d36d92');
    expect(await test('\'derp \\\'escaped\\\' here\'')).toBe('862b6472b7bae5132b2caa5b3cc9c527');
    expect(await test('\'derp \\\'escaped\\\' here\'   stuff')).toBe('862b6472b7bae5132b2caa5b3cc9c527');
    expect(await test('\'Line 1 \\\nLine 2\\\r\nLine 3\\\rEnd\'')).toBe('14a25c0ca3a8268d787932f5ef456998');

    // Failures
    expect(await test('derp')).toBe(FAIL);
    expect(await test('')).toBe(FAIL);
    expect(await test('"0"')).toBe(FAIL);
    expect(await test('#')).toBe(FAIL);
  });
});
