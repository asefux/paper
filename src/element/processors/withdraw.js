const { bn } = require('@asefux/common');
const make = require('./make');

module.exports = make(['holder', 'asset', 'amount'],
  (scope, holder, asset, amount) => ({
    ...scope,
    [holder]: {
      ...(scope[holder] || {}),
      [asset]: (scope[holder][asset] || bn(0)).minus(amount),
    },
  }));
