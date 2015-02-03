'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConfigService', ['$window',
    function ConfigService($window) {

      var getUrl = function () {
        if ($window.location.search.match(/hercules-backend=error/)) {
          return 'https://hercules.hitest.huron-dev.com/fubar';
        } else {
          var regex = new RegExp("hercules-url=([^&]*)");
          var match = $window.location.search.match(regex);
          if (match && match.length == 2) {
            return decodeURIComponent(match[1]);
          } else {
            return 'https://hercules.hitest.huron-dev.com/v1';
          }
        }
      };

      return {
        getUrl: getUrl
      };
    }
  ]);
