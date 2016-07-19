(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaConfigServiceV2', MediaConfigServiceV2);

  /* @ngInject */
  function MediaConfigServiceV2(UrlConfig) {

    var baseHerculesUrl = UrlConfig.getHerculesUrl();
    var baseHerculesUrlV2 = UrlConfig.getHerculesUrlV2();
    var baseUssUrl = UrlConfig.getUssUrl();
    var baseCalliopeUrl = UrlConfig.getCalliopeUrl();

    var getUrl = function () {
      return baseHerculesUrl;
    };
    var getV2Url = function () {
      return baseHerculesUrlV2;
    };
    var getUSSUrl = function () {
      return baseUssUrl + 'uss/api/v1';
    };
    var getCalliopeUrl = function () {
      return baseCalliopeUrl;
    };

    return {
      getUrl: getUrl,
      getV2Url: getV2Url,
      getUSSUrl: getUSSUrl,
      getCalliopeUrl: getCalliopeUrl
    };
  }
})();
