'use strict';

angular.module('Mediafusion')
  .service('MediafusionConfigService', ['$location', 'Config',
    function MediafusionConfigService($location, Config) {

      var baseHerculesUrl = Config.getHerculesUrl();
      var baseUssUrl = Config.getUssUrl();

      var getUrl = function () {
        return baseHerculesUrl + 'v1';
      };
      var getUSSUrl = function () {
        return baseUssUrl + 'uss/api/v1';
      };

      return {
        getUrl: getUrl,
        getUSSUrl: getUSSUrl
      };
    }
  ]);
