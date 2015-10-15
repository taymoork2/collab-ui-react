(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCacheFactory(CsdmPoller, CsdmCacheUpdater) {
    return {
      create: function (opts) {
        return new CsdmCache(opts, CsdmPoller, CsdmCacheUpdater);
      }
    };
  }

  function CsdmCache(opts, CsdmPoller, CsdmCacheUpdater) {
    var cache = {};
    var shouldUpdateCache;

    function fetch() {
      shouldUpdateCache = true;
      return opts.fetch().then(function (data) {
        if (shouldUpdateCache) {
          CsdmCacheUpdater.update(cache, data);
        }
        return cache;
      });
    }

    var poller = CsdmPoller.create(fetch);

    function list() {
      return cache;
    }

    function remove(url) {
      return opts.remove(url, cache[url]).then(function () {
        delete cache[url];
        shouldUpdateCache = false;
      });
    }

    function update(url, data) {
      return opts.update(url, data).then(function (obj) {
        if (obj) {
          CsdmCacheUpdater.updateOne(cache, url, obj);
          shouldUpdateCache = false;
        }
        return cache[url];
      });
    }

    function create(url, data) {
      return opts.create(url, data).then(function (obj) {
        CsdmCacheUpdater.updateOne(cache, obj.url, obj);
        shouldUpdateCache = false;
        return cache[obj.url];
      });
    }

    return {
      list: list,
      remove: remove,
      update: update,
      create: create,
      subscribe: poller.subscribe
    };
  }

  angular
    .module('Squared')
    .service('CsdmCacheFactory', CsdmCacheFactory);

})();
