'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('LoginCtrl', ['$scope', '$location', '$http', '$routeParams',
    function($scope, $location, $http) {

      $scope.authorizeUrl = 'http://171.68.21.218:8080/atlas-server/atlas/api/v1/authorize';

      $scope.authorizeToken = function(token) {
        if (token) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get($scope.authorizeUrl)
            .success(function() {
              $location.path('/entitlement');
            })
            .error(function(data, status) {
              $scope.data = data || 'Request failed.';
              $scope.status = status;
            });
        }
      };

    }
  ]);
