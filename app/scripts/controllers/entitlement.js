'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('EntitlementCtrl', ['$scope', 'Storage',
    function($scope) {
      $scope.entitle = function(users) {
        console.log(users);
      };

    }
  ]);
