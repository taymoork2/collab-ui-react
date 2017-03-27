(function () {
  'use strict';

  module.exports = angular.module('core.pageparam', [
    require('modules/core/storage').default,
  ])
    .service('PageParam', PageParam)
    .name;

  /* @ngInject */
  function PageParam(LocalStorage) {

    var pageParamKey = 'pageParam';

    var paramData = {
      'route': null,
      'param': {},
    };

    var parseParam = function () {
      var paramString = LocalStorage.get(pageParamKey);
      if (paramString) {
        var rerouteData = paramString.split('_');
        paramData.route = rerouteData[0];
        for (var i = 1; i < rerouteData.length; i++) {
          var kv = rerouteData[i].split(':');
          paramData.param[kv[0]] = kv[1];
        }
      }
    };

    parseParam();

    return {
      set: function (paramString) {
        if (paramString) {
          LocalStorage.put(pageParamKey, paramString);
          parseParam();
        }
      },

      getRoute: function () {
        return paramData.route;
      },

      getParam: function (paramName) {
        return paramData.param[paramName];
      },

      clear: function () {
        LocalStorage.remove(pageParamKey);
        paramData.route = null;
        paramData.param = {};
      },
    };

  }
})();
