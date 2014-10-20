'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:AppdownloadCtrl
 * @description
 * # AppdownloadCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('AppdownloadCtrl', ['$window', '$http', 'Log','Utils',
    function($window, $http, Log, Utils) {

      $http.get('download_urls.json')
        .success(function(data) {
          if (Utils.isIPhone()) {
            $window.location.href = data.iPhoneURL;
          } else if (Utils.isAndroid()) {
            $window.location.href = data.AndroidURL;
          } else {
            $window.location.href = data.webClientURL;
          }
        })
        .error(function(data, status) {
          Log.error('Failed to read download_url.json.' + data + ' Status: ' + status);
        });
    }

  ]);