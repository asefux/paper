const { R, bn } = require('@asefux/common');
const processors = require('./processors');


const processLogs = (currentValue, rawentry) => {
  let log = rawentry;
  if (!Array.isArray(rawentry)) {
    if (typeof (rawentry) === 'string') {
      log = rawentry.split(',').map((x) => x.trim().toLowerCase());
    } else {
      if (!rawentry.type || !processors[rawentry.type]) return currentValue;
      log = processors[rawentry.type].argsFromObject.reduce((r, key) => {
        r.push(R.path(key.split('.'), rawentry));
        return r;
      },
      [rawentry.timestamp || Date.now(),
        rawentry.type]);
    }
  }
  // eslint-disable-next-line no-unused-vars
  const [timestamp, type, ...args] = log;
  if (!processors[type]) {
    //    console.log(`unknown ${type}`);
    return currentValue;
  }
  if (typeof (processors[type].argc) !== 'undefined' && processors[type].argc !== args.length) {
    //    console.error(`log ${timestamp} skipped: ${type} called with wrong number of arguments`);
    return currentValue;
  }
  return processors[type].call(this, currentValue, ...args);
};

class Book {
  constructor() {
    this.entries = [];
    this.cachedValue = {};
  }

  log(rawentry) {
    if (!rawentry) {
      return;
    }
    const entry = rawentry;

    this.entries.push(entry);
    const newCachedValue = [entry].reduce(processLogs, this.cachedValue);

    this.cachedValue = newCachedValue;
  }

  valueComponents() {
    this.cachedValue = this.entries.reduce(processLogs, {});
    return this.cachedValue;
  }

  value(showAccounts = false) {
    const components = this.valueComponents();
    //    const settings = components.settings || {};
    const accounts = R.dissoc('pairs', R.dissoc('settings', components));

    if (showAccounts) {
      return accounts;
    }
    // eslint-disable-next-line no-unused-vars
    return Object.entries(accounts).reduce((assetMatrix, [holder, assets]) => Object.entries(assets).reduce((resultAsset, [asset, value]) => {
      if (!resultAsset[asset]) {
        return {
          ...resultAsset,
          [asset]: bn(value),
        };
      }
      return {
        ...resultAsset,
        [asset]: resultAsset[asset].plus(value),
      };
    }, assetMatrix), {});
  }

  pairsValue() {
    const components = this.valueComponents();
    const { pairs } = components;
    if (!pairs) return {};
    const normalizedPairs = Object.entries(pairs).reduce((rByPairs, [pair, stat]) => ({
      ...rByPairs,
      [pair]: {
        ...(rByPairs[pair] || {}),
        buy: {
          volume: bn((stat.buy || {}).volume || 0).toFixed(8),
          cost: bn((stat.buy || {}).cost || 0).toFixed(8),
          price: (stat.buy && stat.buy.volume && !bn(stat.buy.volume).isZero())
            ? bn(stat.buy.cost).dividedBy(stat.buy.volume).toFixed(8)
            : bn(0).toFixed(8),

        },
        sell: {
          volume: bn((stat.sell || {}).volume || 0).toFixed(8),
          cost: bn((stat.sell || {}).cost || 0).toFixed(8),
          price: (stat.sell && stat.sell.volume && !bn(stat.sell.volume).isZero())
            ? bn(stat.sell.cost).dividedBy(stat.sell.volume).toFixed(8)
            : bn(0).toFixed(8),
        },
      },
    }), {});

    const withRemaining = Object.entries(normalizedPairs).reduce((rPairs, [pair, stat]) => {
      const remainingVolume = bn(stat.buy.volume).minus(stat.sell.volume);
      const remainingCost = bn(stat.buy.cost).minus(stat.sell.cost);
      const bep = remainingCost.isZero() ? bn(0) : remainingCost.dividedBy(remainingVolume);
      return {
        ...(rPairs || {}),
        [pair]: {
          ...stat,
          remaining: {
            price: bep.toFixed(8),
            volume: remainingVolume.toFixed(8),
            cost: remainingCost.toFixed(8),
          },
        },
      };
    }, {});

    return withRemaining;
  }

  pValue(showAccounts = false) {
    const value = this.value(showAccounts);
    if (showAccounts) {
      return Object.entries(value).reduce((result, [holder, values]) => ({
        ...result,
        [holder]: Object.entries(values).reduce((r, [asset, v]) => ({
          ...r,
          [asset]: bn(v).toFixed(8),
        }), result[holder] || {}),
      }), {});
    }
    return Object.entries(value).reduce((result, [asset, amount]) => ({
      ...result,
      [asset]: bn(amount).toFixed(8),
    }), {});
  }
}

module.exports = Book;
