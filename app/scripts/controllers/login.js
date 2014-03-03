'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', '$http', 'Storage', 'Config',
    function($scope, $location, $window, $http, Storage, Config) {

      var authorizeUrl = Config.adminUrl + 'authorize';
      var token = Storage.get('accessToken');
      $scope.result = 'Loading...';
      $scope.token = token ? true : false;

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
        $window.location.href = Config.oauth2LoginUrl;
      }

    }

  ]);
