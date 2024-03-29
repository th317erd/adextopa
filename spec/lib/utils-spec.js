/* eslint-disable max-classes-per-file */
/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../support/test-helpers.js';

import {
  Utils,
} from '../../lib/index.js';

describe('Utils', () => {
  describe('isPlainObject', () => {
    it('works', () => {
      class Test {}

      expect(Utils.isPlainObject(undefined)).toBe(false);
      expect(Utils.isPlainObject(null)).toBe(false);
      expect(Utils.isPlainObject(NaN)).toBe(false);
      expect(Utils.isPlainObject(Infinity)).toBe(false);
      expect(Utils.isPlainObject('test')).toBe(false);
      expect(Utils.isPlainObject(new String('test'))).toBe(false);
      expect(Utils.isPlainObject(2.0)).toBe(false);
      expect(Utils.isPlainObject(new Number(2.0))).toBe(false);
      expect(Utils.isPlainObject(true)).toBe(false);
      expect(Utils.isPlainObject(false)).toBe(false);
      expect(Utils.isPlainObject(new Boolean(true))).toBe(false);
      expect(Utils.isPlainObject(BigInt(1))).toBe(false);
      expect(Utils.isPlainObject(new Map())).toBe(false);
      expect(Utils.isPlainObject(new Set())).toBe(false);
      expect(Utils.isPlainObject(new Array())).toBe(false);
      expect(Utils.isPlainObject(new Map())).toBe(false);
      expect(Utils.isPlainObject(new Test())).toBe(false);
      expect(Utils.isPlainObject(new Object())).toBe(true);
      expect(Utils.isPlainObject({})).toBe(true);
      expect(Utils.isPlainObject(Object.create(null))).toBe(true);
    });
  });

  describe('cloneRegExp', () => {
    it('works', () => {
      const test = (regexp, forceFlags, disallowFlags) => {
        let result = Utils.cloneRegExp(regexp, forceFlags, disallowFlags);
        expect(result !== regexp).toBe(true);
        return { source: result.source, flags: result.flags };
      };

      expect(test(/hello/)).toEqual({ source: 'hello', flags: '' });
      expect(test(/hello/g)).toEqual({ source: 'hello', flags: 'g' });
      expect(test(/hello/, [ 'g' ])).toEqual({ source: 'hello', flags: 'g' });
      expect(test(/hello/, [ 'i', 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
      expect(test(/hello/i, [ 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
      expect(test(/hello/ig, [ 'g' ], [ 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
      expect(test(/hello/ig, [ 'g' ], [ 'i' ])).toEqual({ source: 'hello', flags: 'g' });
      expect(test(/hello/ig, null, [ 'i', 'g' ])).toEqual({ source: 'hello', flags: '' });
      expect(test(/hello/ig, null, 'ig')).toEqual({ source: 'hello', flags: '' });
      expect(test(/hello/ig, 'mi', 'ig')).toEqual({ source: 'hello', flags: 'im' });
    });
  });

  describe('fetch', () => {
    it('works', () => {
      let data = {
        test:  true,
        array: [
          {
            value: 1,
          },
          {
            value: 2,
          },
          3,
        ],
        area: {
          one: {
            hello: 'world',
          },
          two: {

          },
          three: false,
          four:  null,
        },
        dynamic: {
          get(key) {
            return `${key}{waz.here}`;
          },
        },
      };

      expect(Utils.fetch.call(data, 'test')).toBe(true);
      expect(Utils.fetch.call(data, 'array.length')).toBe(3);
      expect(Utils.fetch.call(data, 'array.size')).toBe(3);
      expect(Utils.fetch.call(data, 'array.0')).toBe(data.array[0]);
      expect(Utils.fetch.call(data, 'array.0.value')).toBe(data.array[0].value);
      expect(Utils.fetch.call(data, 'array.1')).toBe(data.array[1]);
      expect(Utils.fetch.call(data, 'array.1.value')).toBe(data.array[1].value);
      expect(Utils.fetch.call(data, 'array.2')).toBe(data.array[2]);
      expect(Utils.fetch.call(data, 'array.2.value')).toBe(data.array[2].value); // undefined
      expect(Utils.fetch.call(data, 'area')).toBe(data.area);
      expect(Utils.fetch.call(data, 'area.one')).toBe(data.area.one);
      expect(Utils.fetch.call(data, 'area.one.hello')).toBe(data.area.one.hello);
      expect(Utils.fetch.call(data, 'area.two')).toBe(data.area.two);
      expect(Utils.fetch.call(data, 'area.three')).toBe(data.area.three);
      expect(Utils.fetch.call(data, 'area.three.something')).toBe(undefined);
      expect(Utils.fetch.call(data, 'area.four')).toBe(undefined); // null will return the defaultValue
      expect(Utils.fetch.call(data, 'area.three.something', 'derp')).toBe('derp'); // defaultValue
      expect(Utils.fetch.call(data, 'area.nonexistent.something', 'derp')).toBe('derp'); // defaultValue
      expect(Utils.fetch.call(data, 'dang', 'derp')).toBe('derp'); // defaultValue
      expect(Utils.fetch.call(data, undefined, 'derp')).toBe('derp'); // defaultValue
      expect(Utils.fetch.call(data, null, 'derp')).toBe('derp'); // defaultValue
      expect(Utils.fetch.call(data, 'dynamic.test')).toBe('test{waz.here}'); // getter
      expect(Utils.fetch.call(data, 'dynamic.derp')).toBe('derp{waz.here}'); // getter
      expect(Utils.fetch.call(data, 'dynamic.anything')).toBe('anything{waz.here}'); // getter
      expect(Utils.fetch.call(data, 'dynamic.anything.length')).toBe(18); // string length
      expect(Utils.fetch.call(data, 'dynamic.anything.size')).toBe(18); // string length
    });
  });

  describe('typeOf', () => {
    it('works', () => {
      class Test {}

      expect(Utils.typeOf({})).toBe('Object');
      expect(Utils.typeOf(undefined)).toBe('undefined');
      expect(Utils.typeOf(null)).toBe('undefined');
      expect(Utils.typeOf(NaN)).toBe('undefined');
      expect(Utils.typeOf(Infinity)).toBe('Number');
      expect(Utils.typeOf(-Infinity)).toBe('Number');
      expect(Utils.typeOf('test')).toBe('String');
      expect(Utils.typeOf(new String('test'))).toBe('String');
      expect(Utils.typeOf(2.0)).toBe('Number');
      expect(Utils.typeOf(new Number(2.0))).toBe('Number');
      expect(Utils.typeOf(true)).toBe('Boolean');
      expect(Utils.typeOf(false)).toBe('Boolean');
      expect(Utils.typeOf(new Boolean(true))).toBe('Boolean');
      expect(Utils.typeOf(new Boolean(false))).toBe('Boolean');
      expect(Utils.typeOf(1n)).toBe('BigInt');
      expect(Utils.typeOf(BigInt(1))).toBe('BigInt');
      expect(Utils.typeOf([])).toBe('Array');
      expect(Utils.typeOf(new Array())).toBe('Array');
      expect(Utils.typeOf({})).toBe('Object');
      expect(Utils.typeOf(Object.create(null))).toBe('Object');
      expect(Utils.typeOf(new Test())).toBe('Test');
      expect(Utils.typeOf(new Map())).toBe('Map');
      expect(Utils.typeOf(new Set())).toBe('Set');
      expect(Utils.typeOf(new WeakMap())).toBe('WeakMap');
      expect(Utils.typeOf(() => {})).toBe('Function');

      expect(Utils.typeOf(Math)).toBe('Object');
      expect(Utils.typeOf(JSON)).toBe('Object');
      expect(Utils.typeOf(Atomics)).toBe('Object');
      expect(Utils.typeOf(Reflect)).toBe('Object');

      expect(Utils.typeOf(Test)).toBe('[Class Test]');
      expect(Utils.typeOf(AggregateError)).toBe('[Class AggregateError]');
      expect(Utils.typeOf(Array)).toBe('[Class Array]');
      expect(Utils.typeOf(ArrayBuffer)).toBe('[Class ArrayBuffer]');
      expect(Utils.typeOf(BigInt)).toBe('[Class BigInt]');
      expect(Utils.typeOf(BigInt64Array)).toBe('[Class BigInt64Array]');
      expect(Utils.typeOf(BigUint64Array)).toBe('[Class BigUint64Array]');
      expect(Utils.typeOf(Boolean)).toBe('[Class Boolean]');
      expect(Utils.typeOf(DataView)).toBe('[Class DataView]');
      expect(Utils.typeOf(Date)).toBe('[Class Date]');
      expect(Utils.typeOf(Error)).toBe('[Class Error]');
      expect(Utils.typeOf(EvalError)).toBe('[Class EvalError]');
      expect(Utils.typeOf(FinalizationRegistry)).toBe('[Class FinalizationRegistry]');
      expect(Utils.typeOf(Float32Array)).toBe('[Class Float32Array]');
      expect(Utils.typeOf(Float64Array)).toBe('[Class Float64Array]');
      expect(Utils.typeOf(Function)).toBe('[Class Function]');
      expect(Utils.typeOf(Int16Array)).toBe('[Class Int16Array]');
      expect(Utils.typeOf(Int32Array)).toBe('[Class Int32Array]');
      expect(Utils.typeOf(Int8Array)).toBe('[Class Int8Array]');
      expect(Utils.typeOf(Map)).toBe('[Class Map]');
      expect(Utils.typeOf(Number)).toBe('[Class Number]');
      expect(Utils.typeOf(Object)).toBe('[Class Object]');
      expect(Utils.typeOf(Proxy)).toBe('[Class Proxy]');
      expect(Utils.typeOf(RangeError)).toBe('[Class RangeError]');
      expect(Utils.typeOf(ReferenceError)).toBe('[Class ReferenceError]');
      expect(Utils.typeOf(RegExp)).toBe('[Class RegExp]');
      expect(Utils.typeOf(Set)).toBe('[Class Set]');
      expect(Utils.typeOf(SharedArrayBuffer)).toBe('[Class SharedArrayBuffer]');
      expect(Utils.typeOf(String)).toBe('[Class String]');
      expect(Utils.typeOf(Symbol)).toBe('[Class Symbol]');
      expect(Utils.typeOf(SyntaxError)).toBe('[Class SyntaxError]');
      expect(Utils.typeOf(TypeError)).toBe('[Class TypeError]');
      expect(Utils.typeOf(Uint16Array)).toBe('[Class Uint16Array]');
      expect(Utils.typeOf(Uint32Array)).toBe('[Class Uint32Array]');
      expect(Utils.typeOf(Uint8Array)).toBe('[Class Uint8Array]');
      expect(Utils.typeOf(Uint8ClampedArray)).toBe('[Class Uint8ClampedArray]');
      expect(Utils.typeOf(URIError)).toBe('[Class URIError]');
      expect(Utils.typeOf(WeakMap)).toBe('[Class WeakMap]');
      expect(Utils.typeOf(WeakRef)).toBe('[Class WeakRef]');
      expect(Utils.typeOf(WeakSet)).toBe('[Class WeakSet]');
    });
  });

  describe('isType', () => {
    it('works', () => {
      expect(Utils.isType(WeakSet, '[Class WeakSet]')).toBe(true);
      expect(Utils.isType(JSON, 'Class')).toBe(false);
      expect(Utils.isType(JSON, 'Class', 'Object')).toBe(true);
      expect(Utils.isType(2.0, 'Class', 'Object', 'Number')).toBe(true);
    });
  });

  describe('isPrimitive', () => {
    it('works', () => {
      class Test {}

      expect(Utils.isPrimitive(() => {})).toBe(false);
      expect(Utils.isPrimitive(Set)).toBe(false);
      expect(Utils.isPrimitive({})).toBe(false);
      expect(Utils.isPrimitive([])).toBe(false);
      expect(Utils.isPrimitive(undefined)).toBe(false);
      expect(Utils.isPrimitive(null)).toBe(false);
      expect(Utils.isPrimitive(NaN)).toBe(false);
      expect(Utils.isPrimitive(Infinity)).toBe(false);
      expect(Utils.isPrimitive(-Infinity)).toBe(false);
      expect(Utils.isPrimitive(Symbol.for('test'))).toBe(false);
      expect(Utils.isPrimitive(new Test())).toBe(false);
      expect(Utils.isPrimitive(2n)).toBe(false);
      expect(Utils.isPrimitive(BigInt(2))).toBe(false);

      expect(Utils.isPrimitive(true)).toBe(true);
      expect(Utils.isPrimitive(new Boolean(true))).toBe(true);
      expect(Utils.isPrimitive(1)).toBe(true);
      expect(Utils.isPrimitive(new Number(1))).toBe(true);
      expect(Utils.isPrimitive('test')).toBe(true);
      expect(Utils.isPrimitive(new String('test'))).toBe(true);
    });
  });

  describe('isValidNumber', () => {
    it('works', () => {
      class Test {}

      expect(Utils.isValidNumber(() => {})).toBe(false);
      expect(Utils.isValidNumber(Set)).toBe(false);
      expect(Utils.isValidNumber({})).toBe(false);
      expect(Utils.isValidNumber([])).toBe(false);
      expect(Utils.isValidNumber(undefined)).toBe(false);
      expect(Utils.isValidNumber(null)).toBe(false);
      expect(Utils.isValidNumber(NaN)).toBe(false);
      expect(Utils.isValidNumber(Infinity)).toBe(false);
      expect(Utils.isValidNumber(-Infinity)).toBe(false);
      expect(Utils.isValidNumber(Symbol.for('test'))).toBe(false);
      expect(Utils.isValidNumber(new Test())).toBe(false);
      expect(Utils.isValidNumber(2n)).toBe(false);
      expect(Utils.isValidNumber(BigInt(2))).toBe(false);
      expect(Utils.isValidNumber(true)).toBe(false);
      expect(Utils.isValidNumber(new Boolean(true))).toBe(false);
      expect(Utils.isValidNumber('test')).toBe(false);
      expect(Utils.isValidNumber(new String('test'))).toBe(false);

      expect(Utils.isValidNumber(0)).toBe(true);
      expect(Utils.isValidNumber(-2.5)).toBe(true);
      expect(Utils.isValidNumber(1.5)).toBe(true);
      expect(Utils.isValidNumber(1)).toBe(true);
      expect(Utils.isValidNumber(new Number(1))).toBe(true);
      expect(Utils.isValidNumber(new Number(-1))).toBe(true);
    });
  });

  describe('isSerializable', () => {
    it('works', () => {
      class Test {}

      class JSONTest {
        toJSON() {
          return {};
        }
      }

      expect(Utils.isSerializable(() => {})).toBe(false);
      expect(Utils.isSerializable(Set)).toBe(false);
      expect(Utils.isSerializable(undefined)).toBe(false);
      expect(Utils.isSerializable(NaN)).toBe(false);
      expect(Utils.isSerializable(Infinity)).toBe(false);
      expect(Utils.isSerializable(-Infinity)).toBe(false);
      expect(Utils.isSerializable(Symbol.for('test'))).toBe(false);
      expect(Utils.isSerializable(new Test())).toBe(false);
      expect(Utils.isSerializable(2n)).toBe(false);
      expect(Utils.isSerializable(BigInt(2))).toBe(false);

      expect(Utils.isSerializable(new JSONTest())).toBe(true);
      expect(Utils.isSerializable(null)).toBe(true);
      expect(Utils.isSerializable({})).toBe(true);
      expect(Utils.isSerializable([])).toBe(true);
      expect(Utils.isSerializable(true)).toBe(true);
      expect(Utils.isSerializable(new Boolean(true))).toBe(true);
      expect(Utils.isSerializable(1)).toBe(true);
      expect(Utils.isSerializable(new Number(1))).toBe(true);
      expect(Utils.isSerializable('test')).toBe(true);
      expect(Utils.isSerializable(new String('test'))).toBe(true);
    });
  });

  describe('makeKeysNonEnumerable', () => {
    it('works', () => {
      let obj = { test: true, hello: 'world' };
      expect(Object.keys(obj)).toEqual([ 'test', 'hello' ]);
      expect(Utils.makeKeysNonEnumerable(obj)).toBe(obj);
      expect(Object.keys(obj)).toEqual([]);
    });
  });

  describe('nonEnumerableAssign', () => {
    it('works', () => {
      let obj = { test: true, hello: 'world' };
      let obj2 = Utils.nonEnumerableAssign({}, obj);

      expect(Object.keys(obj)).toEqual([ 'test', 'hello' ]);
      expect(Object.keys(obj2)).toEqual([]);
      expect(_TestHelpers.inspect.call({ compact: true, colors: false, showHidden: true }, obj2)).toEqual("{ [test]: true, [hello]: 'world' }");
    });
  });

  describe('iterate', () => {
    it('works', () => {
      let obj = { test: true, hello: 'world' };

      expect(Utils.iterate(obj, (key) => key)).toEqual([ 'test', 'hello' ]);
      expect(Utils.iterate(obj, (_, value) => value)).toEqual([ true, 'world' ]);

      let obj2 = new Map();
      obj2.set('test', true);
      obj2.set('hello', 'world');

      expect(Utils.iterate(obj2, (key) => key)).toEqual([ 'test', 'hello' ]);
      expect(Utils.iterate(obj2, (_, value) => value)).toEqual([ true, 'world' ]);

      let arr = [];
      arr.push(true);
      arr.push('world');

      expect(Utils.iterate(arr, (key) => key)).toEqual([ 0, 1 ]);
      expect(Utils.iterate(arr, (_, value) => value)).toEqual([ true, 'world' ]);
    });
  });

  describe('noe', () => {
    it('works', () => {
      expect(Utils.noe(undefined)).toBe(true);
      expect(Utils.noe(null)).toBe(true);
      expect(Utils.noe(NaN)).toBe(true);
      expect(Utils.noe('')).toBe(true);
      expect(Utils.noe('   ')).toBe(true);
      expect(Utils.noe('   \n\r\n')).toBe(true);
      expect(Utils.noe([])).toBe(true);
      expect(Utils.noe({})).toBe(true);

      expect(Utils.noe(0)).toBe(false);
      expect(Utils.noe(true)).toBe(false);
      expect(Utils.noe(false)).toBe(false);
    });
  });
});
