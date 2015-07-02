'use strict';

angular.module('Squared')
  .service('CsdmConfigService', ['$window', 'Config',
    function ConfigService($window, Config) {

      var getOverriddenUrl = function (queryParam) {
        var regex = new RegExp(queryParam + "=([^&]*)");
        var match = $window.location.search.match(regex);
        if (match && match.length == 2) {
          return decodeURIComponent(match[1]);
        }
      };

      var getUrl = function () {
        var overriddenUrl = getOverriddenUrl('csdm-url');
        if (overriddenUrl) {
          return overriddenUrl;
        } else {
          return Config.getCsdmServiceUrl();
        }
      };

      var getEnrollmentServiceUrl = function () {
        return Config.getEnrollmentServiceUrl();
      };

      return {
        getUrl: getUrl,
        getEnrollmentServiceUrl: getEnrollmentServiceUrl
      };
    }
  ]);
