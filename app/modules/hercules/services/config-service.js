'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConfigService', ['$window', 'Config',
    function ConfigService($window, Config) {

      var baseUrl = Config.getHerculesUrl();

      var getUrl = function () {
        if ($window.location.search.match(/hercules-backend=error/)) {
          return baseUrl + 'fubar';
        } else {
          var regex = new RegExp("hercules-url=([^&]*)");
          var match = $window.location.search.match(regex);
          if (match && match.length == 2) {
            return decodeURIComponent(match[1]);
          } else {
            return baseUrl + 'v1';
          }
        }
      };

      return {
        getUrl: getUrl
      };
    }
  ]);
