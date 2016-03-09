'use strict';

angular.module('Hercules')
  .service('ConfigService', ['$window', 'UrlConfig',
    function ConfigService($window, UrlConfig) {

      var baseHerculesUrl = UrlConfig.getHerculesUrl();
      var baseHerculesUrlV2 = UrlConfig.getHerculesUrlV2();
      var baseUssUrl = UrlConfig.getUssUrl();
      var baseCertsUrl = UrlConfig.getCertsUrl();

      var getUrl = function () {
        return baseHerculesUrl;
      };
      var getUrlV2 = function () {
        return baseHerculesUrlV2;
      };
      var getUSSUrl = function () {
        return baseUssUrl + 'uss/api/v1';
      };
      var getCertsUrl = function () {
        return baseCertsUrl + 'certificate/api/v1';
      };

      return {
        getUrl: getUrl,
        getUrlV2: getUrlV2,
        getUSSUrl: getUSSUrl,
        getCertsUrl: getCertsUrl
      };
    }
  ]);
