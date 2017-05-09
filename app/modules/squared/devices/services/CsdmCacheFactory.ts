import { CsdmHubFactory, CsdmPollerFactory, Hub } from './CsdmPoller';
import { CsdmCacheUpdater } from './CsdmCacheUpdater';
class CsdmCacheFactory {
  /* @ngInject  */
  constructor(private CsdmPoller: CsdmPollerFactory, private CsdmCacheUpdater: CsdmCacheUpdater, private CsdmHubFactory: CsdmHubFactory) {
  }

  public create(opts) {
    return new CsdmCache(opts, this.CsdmPoller, this.CsdmCacheUpdater, this.CsdmHubFactory);
  }
}

class CsdmCache {
  private cache = {};
  private shouldUpdateCache: boolean;
  private hub: Hub;
  constructor(private opts, CsdmPoller: CsdmPollerFactory, private CsdmCacheUpdater: CsdmCacheUpdater, CsdmHubFactory: CsdmHubFactory) {
    this.hub = CsdmHubFactory.create();
    if (opts.initializeData) {
      opts.initializeData.then((data) => {
        this.CsdmCacheUpdater.update(this.cache, data);
        this.hub.emit('data', {
          data: data,
        });
      });
    }

    CsdmPoller.create(this.fetch, this.hub);
  }

  private fetch() {
    this.shouldUpdateCache = true;
    return this.opts.fetch().then((data) => {
      if (this.shouldUpdateCache) {
        this.CsdmCacheUpdater.update(this.cache, data);
      }
      return this.cache;
    });
  }

  public list() {
    return this.cache;
  }

  public remove(url) {
    return this.opts.remove(url, this.cache[url]).then(() => {
      delete this.cache[url];
      this.shouldUpdateCache = false;
      this.hub.emit('data');
      this.hub.emit('remove', url);
    });
  }

  public update(url, data) {
    return this.opts.update(url, data).then((obj) => {
      if (obj) {
        this.CsdmCacheUpdater.updateOne(this.cache, url, obj);
        this.shouldUpdateCache = false;
        this.hub.emit('data');
        this.hub.emit('update', obj);
      }
      return this.cache[url];
    });
  }

  public get(url) {
    return this.opts.get(url).then((obj) => {
      if (obj) {
        this.CsdmCacheUpdater.updateOne(this.cache, url, obj);
        this.shouldUpdateCache = false;
        this.hub.emit('data');
        this.hub.emit('read', obj);
      }
      return this.cache[url];
    });
  }

  public create(url, data) {
    return this.opts.create(url, data).then((obj) => {
      this.CsdmCacheUpdater.updateOne(this.cache, obj.url, obj);
      this.shouldUpdateCache = false;
      this.hub.emit('data');
      this.hub.emit('create', obj);
      return this.cache[obj.url];
    });
  }
}

module.exports = angular
    .module('Squared')
    .service('CsdmCacheFactory', CsdmCacheFactory)
  .name;
