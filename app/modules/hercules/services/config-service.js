'use strict';

angular.module('Hercules')
  .service('ConfigService', ['$window', 'Config',
    function ConfigService($window, Config) {

      var baseHerculesUrl = Config.getHerculesUrl();
      var baseUssUrl = Config.getUssUrl();
      var baseCertsUrl = Config.getCertsUrl();

      var getUrl = function () {
        return baseHerculesUrl;
      };
      var getUSSUrl = function () {
        return baseUssUrl + 'uss/api/v1';
      };
      var getCertsUrl = function () {
        return baseCertsUrl + 'certificate/api/v1';
      };

      return {
        getUrl: getUrl,
        getUSSUrl: getUSSUrl,
        getCertsUrl: getCertsUrl
      };
    }
  ]);
