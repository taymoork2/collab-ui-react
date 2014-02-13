'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('EntitlementCtrl', ['$scope',
    function($scope) {
      $scope.entitle = function(users) {
        console.log(users);
      };

    }
  ]);
