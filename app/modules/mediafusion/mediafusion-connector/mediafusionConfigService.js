'use strict';

angular.module('Mediafusion')
  .service('MediafusionConfigService', ['$location', 'Config',
    function MediafusionConfigService($location, Config) {

      var baseHerculesUrl = Config.getHerculesUrl();
      var baseUssUrl = Config.getUssUrl();

      var getOverriddenUrl = function (queryParam) {
        var searchObject = $location.search();
        var override = searchObject[queryParam];
        if (angular.isDefined(override) && override !== '') {
          return decodeURIComponent(override);
        }
      };
      var getUrl = function () {
        var overriddenUrl = getOverriddenUrl('hercules-url');
        if (overriddenUrl) {
          return overriddenUrl;
        } else {
          return baseHerculesUrl + 'v1';
        }
      };
      var getUSSUrl = function () {
        var overriddenUrl = getOverriddenUrl('uss-url');
        if (overriddenUrl) {
          return overriddenUrl;
        } else {
          return baseUssUrl + 'uss/api/v1';
        }
      };
      return {
        getUrl: getUrl,
        getUSSUrl: getUSSUrl
      };
    }
  ]);
