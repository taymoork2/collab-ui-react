'use strict';

angular.module('Core')
  .controller('AccountReviewCtrl', ['$scope', '$location', 'Storage', 'Log',
    function ($scope, $location, Storage, Log) {

      $scope.nextStep = function () {
        $location.path('/initialsetup/adduser');
      };
    }
  ]);
