'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', '$http', 'Storage', 'Config',
    function($scope, $location, $window, $http, Storage, Config) {

      var authorizeUrl = Config.adminServiceUrl + 'authorize';
      var token = Storage.get('accessToken');
      $scope.result = 'Loading...';
      $scope.token = token ? true : false;

      // Set oauth url depending on the environment
      var oauth2LoginUrl = document.URL.indexOf('127.0.0.1') !== -1 ? Config.oauth2LoginUrlDev : Config.oauth2LoginUrlProd;

      if (token) {
        $scope.result = 'Authorizing user...';
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
        $http.get(authorizeUrl)
          .success(function() {
            $scope.token = true;
            $location.path('/users');
          })
          .error(function(data, status) {
            $scope.data = data || 'Authorization failed.';
            $scope.result = 'Authorization failed. Status: ' + status + '.';
          });
      } else {
        console.log('No accessToken.');
        $window.location.href = oauth2LoginUrl;
      }
    }

  ]);
