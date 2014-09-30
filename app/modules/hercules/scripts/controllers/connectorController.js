'use strict';

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http', 'Auth',
    function($scope, $rootScope, $http, Auth) {
      Auth.isAuthorized($scope);

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
