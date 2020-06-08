const { bn } = require('@asefux/common');

const change = require('./change');

const make = require('./make');

module.exports = make(['base.holder', 'base.asset', 'base.amount', 'quote.holder', 'quote.asset', 'quote.amount'],
  (scope, baseHolder, baseAsset, baseAmount, quoteHolder, quoteAsset, quoteAmount) => {
    const changeScope = change(scope, quoteHolder, quoteAsset, quoteAmount, baseHolder, baseAsset, baseAmount);
    const pair = `${baseAsset}/${quoteAsset}`;
    const pairsScope = changeScope.pairs || {};
    const currentPairScope = pairsScope[pair] || {
      buy: {
        volume: bn(0),
        cost: bn(0),
      },
      sell: {
        volume: bn(0),
        cost: bn(0),
      },
    };

    return ({
      ...changeScope,
      pairs: {
        ...pairsScope,
        [pair]: {
          ...currentPairScope,
          buy: {
            volume: currentPairScope.buy.volume.plus(baseAmount),
            cost: currentPairScope.buy.cost.plus(quoteAmount),
          },
        },
      },
    });
  });
