export const VIRTUAL_RESOLVER = Symbol.for('/adextopa/constants/virtual_resolver');

export class ValueResolver {
  constructor(target, name, opts) {
    Object.defineProperties(this, {
      '_options': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        opts || {},
      },
      'target': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        target,
      },
      'name': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        name || 'ValueResolver',
      },
    });
  }

  getOptions() {
    return this._options;
  }

  fetchProp(context, _keyName, _opts) {
    let keyName = this.resolveValue(context, _keyName);
    if (!keyName)
      throw new Error('ValueResolver: Specified key to fetch from scope is empty.');

    let opts            = Object.assign(Object.create(this.getOptions()), _opts || {});
    let keyNameParts    = keyName.split('.');
    let primaryKeyName  = keyNameParts[0];
    let defaultValue    = this.resolveValue(context, opts.defaultValue);
    let scope           = this.target.scope;

    context.debugLog(`${context.debugColor('fg:cyan', this.name)}: Fetching "${keyName}" from context: `, scope);

    if (defaultValue === undefined)
      defaultValue = null;

    const doFetch = () => {
      if ((!primaryKeyName && keyNameParts.length > 1) || scope.has(primaryKeyName)) {
        let pkValue = (!primaryKeyName) ? context.getFromScope('@') : scope.get(primaryKeyName);
        let value = this.resolveValue(context, pkValue);
        if (value == null)
          return defaultValue;

        if (value && keyNameParts.length > 1) {
          for (let i = 1, il = keyNameParts.length; i < il; i++) {
            let part = keyNameParts[i];
            if (typeof value.fetchProp === 'function')
              value = this.resolveValue(context, value.fetchProp(context, part, { skipDefaultFetch: true }));
            else
              value = null;

            if (value == null)
              return defaultValue;
          }
        }

        if (opts.skipDefaultFetch !== true && value && typeof value.fetchProp === 'function')
          value = this.resolveValue(context, value.fetchProp(context, '$default'));

        return (value == null) ? defaultValue : value;
      } else {
        return defaultValue;
      }
    };

    let result = doFetch();

    if (result != null)
      context.debugLog(`${context.debugColor('fg:cyan', this.name)}: Successfully fetched value[${keyName}]: `, result);
    else
      context.debugLog(`${context.debugColor('fg:cyan', this.name)}: Failed to fetch specified value[${keyName}]`);

    return result;
  }

  resolveValue(context, value, opts) {
    if (value && typeof value[VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(context, value[VIRTUAL_RESOLVER](context, opts), opts);

    return value;
  }
}
