'use strict';

angular.module('Hercules')
  .service('ConfigService', ['$window', 'Config',
    function ConfigService($window, Config) {

      var baseHerculesUrl = Config.getHerculesUrl();
      var baseHerculesUrlV2 = Config.getHerculesUrlV2();
      var baseUssUrl = Config.getUssUrl();
      var baseCertsUrl = Config.getCertsUrl();

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
