const { bn } = require('@asefux/common');
const make = require('./make');

module.exports = make(['base.holder', 'base,asset', 'base.amount', 'quote.holder', 'quote.asset', 'quote.amount'],
  (scope, baseHolder, baseAsset, baseAmount, quoteHolder, quoteAsset, quoteAmount) => (
    baseHolder !== quoteHolder ? ({
      ...scope,
      [baseHolder]: {
        ...(scope[baseHolder] || {}),
        [baseAsset]: ((scope[baseHolder] || {})[baseAsset] || bn(0)).minus(baseAmount),
        [quoteAsset]: ((scope[quoteHolder] || {})[quoteAsset] || bn(0)).plus(quoteAmount),
      },
      [quoteHolder]: {
        ...(scope[quoteHolder] || {}),
        [quoteAsset]: ((scope[quoteHolder] || {})[quoteAsset] || bn(0)).minus(quoteAmount),
        [baseAsset]: ((scope[quoteHolder] || {})[baseAsset] || bn(0)).plus(baseAmount),
      },
    })
      : ({
        ...scope,
        [baseHolder]: {
          ...(scope[baseHolder] || {}),
          [baseAsset]: ((scope[baseHolder] || {})[baseAsset] || bn(0)).minus(baseAmount),
          [quoteAsset]: ((scope[baseHolder] || {})[quoteAsset] || bn(0)).plus(quoteAmount),
        },
      })
  ));
