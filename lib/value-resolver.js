export const VIRTUAL_RESOLVER = Symbol.for('/adextopa/constants/virtual_resolver');

export class ValueResolver {
  constructor(target, name) {
    Object.defineProperties(this, {
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

  fetchProp(context, _keyName, _defaultValue = null) {
    let keyName = this.resolveValue(context, _keyName);
    if (!keyName)
      throw new Error('ValueResolver: Specified key to fetch from scope is empty.');

    let keyNameParts    = keyName.split('.');
    let primaryKeyName  = keyNameParts[0];
    let defaultValue    = this.resolveValue(context, _defaultValue);
    let scope           = this.target.scope;

    context.debugLog(`${context.debugColor('fg:cyan', this.name)}: Fetching "${keyName}" from context: `, this.scope);

    if (defaultValue === undefined)
      defaultValue = null;

    const doFetch = () => {
      if (scope.has(primaryKeyName)) {
        let value = this.resolveValue(context, scope.get(primaryKeyName));
        if (value == null)
          return defaultValue;

        if (value && keyNameParts.length > 1) {
          for (let i = 1, il = keyNameParts.length; i < il; i++) {
            let part = keyNameParts[i];
            if (typeof value.fetchProp === 'function')
              value = this.resolveValue(context, value.fetchProp(context, part));
            else
              value = null;

            if (value == null)
              return defaultValue;
          }
        }

        if (value && typeof value.fetchProp === 'function')
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

  resolveValue(context, value) {
    if (value && typeof value[VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(context, value[VIRTUAL_RESOLVER](context));

    return value;
  }
}
