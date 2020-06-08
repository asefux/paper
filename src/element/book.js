const { R, bn } = require('@asefux/common');
const processors = require('./processors');


const processLogs = (currentValue, rawentry) => {
  let log = rawentry;
  if (!Array.isArray(rawentry)) {
    if (typeof (rawentry) === 'string') {
      log = rawentry.split(' ');
    } else {
      if (!rawentry.type || !processors[rawentry.type]) return currentValue;
      log = processors[rawentry.type].argsFromObject.reduce((r, key) => {
        r.push(R.path(key.split('.'), rawentry));
        return r;
      },
      [rawentry.timestamp || Date().now(),
        rawentry.type]);
    }
  }

  const [timestamp, type, ...args] = log;
  if (!processors[type]) {
    return currentValue;
  }
  if (typeof (processors[type].argc) !== 'undefined' && processors[type].argc !== args.length) {
    console.error(`log ${timestamp} skipped: ${type} called with wrong number of arguments`);
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
    this.cachedValue = [entry].reduce(processLogs, this.cachedValue);
  }

  valueComponents() {
    this.cachedValue = this.entries.reduce(processLogs, {});
    return this.cachedValue;
  }

  value(showAccounts = false) {
    const components = this.valueComponents();
    const settings = components.settings || {};
    const accounts = R.dissoc('settings', components);
    if (showAccounts) {
      return accounts;
    }
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
