'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConfigService', ['$window', 'Config',
    function ConfigService($window, Config) {

      var baseUrl = Config.getHerculesUrl();

      var getOverriddenUrl = function (queryParam) {
        var regex = new RegExp(queryParam + "=([^&]*)");
        var match = $window.location.search.match(regex);
        if (match && match.length == 2) {
          return decodeURIComponent(match[1]);
        }
      };
      var getUrl = function () {
        var overriddenUrl = getOverriddenUrl("hercules-url");
        if (overriddenUrl) {
          return overriddenUrl;
        } else {
          return baseUrl + 'v1';
        }
      };
      var getUSSUrl = function () {
        var overriddenUrl = getOverriddenUrl("hercules-uss-url");
        if (overriddenUrl) {
          return overriddenUrl;
        } else {
          return baseUrl + 'uss/api/v1';
        }
      };
      return {
        getUrl: getUrl,
        getUSSUrl: getUSSUrl
      };
    }
  ]);
