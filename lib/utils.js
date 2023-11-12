export function cloneRegExp(regexp, _forceFlags, _disallowFlags) {
  let forceFlags    = _forceFlags;
  let disallowFlags = _disallowFlags;

  if (typeof forceFlags === 'string' || forceFlags instanceof String)
    forceFlags = ('' + forceFlags).toLowerCase().split('');

  if (typeof disallowFlags === 'string' || disallowFlags instanceof String)
    disallowFlags = ('' + disallowFlags).toLowerCase().split('');

  const getFlags = (_flags) => {
    let flags = (_flags || '').split('').map((p) => p.toLowerCase());

    if (disallowFlags && disallowFlags.length > 0)
      flags = flags.filter((flag) => (disallowFlags.indexOf(flag) < 0));

    if (forceFlags && forceFlags.length > 0) {
      for (let i = 0, il = forceFlags.length; i < il; i++) {
        let forceFlag = forceFlags[i];
        if (flags.indexOf(forceFlag) < 0)
          flags.push(forceFlag);
      }
    }

    return flags.sort().join('');
  };

  return new RegExp(regexp.source, getFlags(regexp.flags));
}
