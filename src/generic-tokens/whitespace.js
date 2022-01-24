const { $ANY }  = require('./any');

const $WS = (_opts) => {
  var newLines  = (_opts && _opts.newLines != null) ? _opts.newLines : true;
  var opts      = Object.assign({ chars: (newLines) ? ' \t\r\n' : ' \t', typeName: '$WS' }, _opts || {});

  return $ANY(opts);
};

module.exports = {
  $WS,
};
