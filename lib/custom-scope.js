export class CustomScope {
  constructor(params) {
    let scope = new Map();

    Object.defineProperties(this, {
      'scope': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        scope,
      },
    });

    if (!params)
      return;

    if (typeof params.entries === 'undefined') {
      let keys = Object.keys(params);
      for (let i = 0, il = keys.length; i < il; i++) {
        let key = keys[i];
        let value = params[key];

        scope.set(key, value);
      }
    } else {
      for (let [ key, value ] of params.entries())
        scope.set(key, value);
    }
  }

  fetchProp(context, keyName, opts) {
    let scope = this.scope;
    let value = scope.get(keyName);
    return (value == null) ? (opts && opts.defaultValue) : value;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.scope;
  }
}
