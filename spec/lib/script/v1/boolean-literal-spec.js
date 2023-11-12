/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      BooleanLiteral,
    },
  },
} = Script;

const FAIL = 'ec849c2b4452f1c7538f193a18f1d244';

describe('/Script/V1/BooleanLiteral', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return snapshot(await parser.tokenize(BooleanLiteral(), debug), debug);
    };

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
  });
});
