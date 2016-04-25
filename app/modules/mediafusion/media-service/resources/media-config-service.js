(function() {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaConfigService', MediaConfigService);

  /* @ngInject */
  function MediaConfigService($window, UrlConfig) {

    var baseHerculesUrl = UrlConfig.getHerculesUrl();
    var baseUssUrl = UrlConfig.getUssUrl();
    var baseCalliopeUrl = UrlConfig.getCalliopeUrl();

    var getUrl = function () {
      return baseHerculesUrl;
    };
    var getUSSUrl = function () {
      return baseUssUrl + 'uss/api/v1';
    };
    var getCalliopeUrl = function () {
      return baseCalliopeUrl;
    };

    return {
      getUrl: getUrl,
      getUSSUrl: getUSSUrl,
      getCalliopeUrl: getCalliopeUrl
    };
  }
})();