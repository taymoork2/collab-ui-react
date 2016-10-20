(function () {
  'use strict';

  /* @ngInject  */
  function CsdmCacheFactory(CsdmPoller, CsdmCacheUpdater, CsdmHubFactory) {
    return {
      create: function (opts) {
        return new CsdmCache(opts, CsdmPoller, CsdmCacheUpdater, CsdmHubFactory);
      }
    };
  }

  function CsdmCache(opts, CsdmPoller, CsdmCacheUpdater, CsdmHubFactory) {
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

    var hub = CsdmHubFactory.create();
    if (opts.initializeData) {
      opts.initializeData.then(function (data) {
        CsdmCacheUpdater.update(cache, data);
        hub.emit('data', {
          data: data
        });
      });
    }

    CsdmPoller.create(fetch, hub);

    function list() {
      return cache;
    }

    function remove(url) {
      return opts.remove(url, cache[url]).then(function () {
        delete cache[url];
        shouldUpdateCache = false;
        hub.emit('data');
        hub.emit('remove', url);
      });
    }

    function update(url, data) {
      return opts.update(url, data).then(function (obj) {
        if (obj) {
          CsdmCacheUpdater.updateOne(cache, url, obj);
          shouldUpdateCache = false;
          hub.emit('data');
          hub.emit('update', obj);
        }
        return cache[url];
      });
    }

    function get(url) {
      return opts.get(url).then(function (obj) {
        if (obj) {
          CsdmCacheUpdater.updateOne(cache, url, obj);
          shouldUpdateCache = false;
          hub.emit('data');
          hub.emit('read', obj);
        }
        return cache[url];
      });
    }

    function create(url, data) {
      return opts.create(url, data).then(function (obj) {
        CsdmCacheUpdater.updateOne(cache, obj.url, obj);
        shouldUpdateCache = false;
        hub.emit('data');
        hub.emit('create', obj);
        return cache[obj.url];
      });
    }

    return {
      get: get,
      on: hub.on,
      list: list,
      remove: remove,
      update: update,
      create: create
    };
  }

  angular
    .module('Squared')
    .service('CsdmCacheFactory', CsdmCacheFactory);

})();
