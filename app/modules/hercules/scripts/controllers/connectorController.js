'use strict';

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http',
    function($scope, $rootScope, $http) {

      $scope.loading = true;

      $http
        .get('https://hercules.ladidadi.org/v1/connectors')
        .success(function (data) {
          $scope.connectors = data;
          $scope.loading = false;
        })
        .error(function () {
          console.error('error fetching ladidadi data', arguments);
          $scope.error = true;
          $scope.loading = false;
        });

    }
  ]);
