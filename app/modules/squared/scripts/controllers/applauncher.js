'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ApplauncherCtrl
 * @description
 * # ApplauncherCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ApplauncherCtrl', ['$window', '$http', 'Log', 'Config', 'Utils',
    function($window, $http, Log, Config, Utils) {

      if (Utils.isWeb()) {
        $http.get('download_urls.json')
          .success(function(data) {
            $window.location.href = data.webClientURL;
          })
          .error(function(data, status) {
            Log.error('Failed to read download_url.json.' + data + ' Status: ' + status);
          });
      } else {
        $window.location.href = Config.getSquaredAppUrl();
      }
    }

]);