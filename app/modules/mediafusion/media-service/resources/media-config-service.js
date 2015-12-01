'use strict';

angular.module('Mediafusion')
  .service('MediaConfigService', ['$window', 'Config',
    function MediaConfigService($window, Config) {

      var baseHerculesUrl = Config.getHerculesUrl();
      var baseUssUrl = Config.getUssUrl();
      var baseCalliopeUrl = Config.getCalliopeUrl();

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
  ]);
