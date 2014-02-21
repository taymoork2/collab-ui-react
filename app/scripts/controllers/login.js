'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$window', '$http', 'Storage', 'Config',
    function($scope, $location, $window, $http, Storage, Config) {

      var token = Storage.get('accessToken');
      $scope.token = token ? true : false;

      var authorizeUrl = Config.adminUrl + 'authorize';

      $scope.login = function(loginInput) {
        if (loginInput.$valid) {
          var oauth2LoginUrl = Config.oauth2LoginUrl + loginInput.email;
          $window.location.href = oauth2LoginUrl;
        }
      };

      if (token) {
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
      }

    }

  ]);
