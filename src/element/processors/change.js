const { bn } = require('@asefux/common');
const make = require('./make');

module.exports = make(['from.holder', 'from.asset', 'from.amount', 'to.holder', 'to.asset', 'to.amount'],
  (scope, fromHolder, fromAsset, fromAmount, toHolder, toAsset, toAmount) => (
    fromHolder !== toHolder ? ({
      ...scope,
      [fromHolder]: {
        ...(scope[fromHolder] || {}),
        [fromAsset]: ((scope[fromHolder] || {})[fromAsset] || bn(0)).minus(fromAmount),
        [toAsset]: ((scope[fromHolder] || {})[toAsset] || bn(0)).plus(toAmount),
      },
      [toHolder]: {
        ...(scope[toHolder] || {}),
        [toAsset]: ((scope[toHolder] || {})[toAsset] || bn(0)).minus(toAmount),
        [fromAsset]: ((scope[toHolder] || {})[fromAsset] || bn(0)).plus(fromAmount),
      },
    })
      : ({
        ...scope,
        [fromHolder]: {
          ...(scope[fromHolder] || {}),
          [fromAsset]: ((scope[fromHolder] || {})[fromAsset] || bn(0)).minus(fromAmount),
          [toAsset]: ((scope[fromHolder] || {})[toAsset] || bn(0)).plus(toAmount),
        },
      })
  ));
