'use strict';

angular.module('Core')
  .controller('AccountReviewCtrl', ['$scope', '$location',
    function ($scope, $location) {

      $scope.nextStep = function () {
        $location.path('/initialsetup/adduser');
      };
    }
  ]);
