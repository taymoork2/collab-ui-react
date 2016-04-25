'use strict';

angular.module('Core')
  .controller('AccountReviewCtrl', AccountReviewCtrl);

/* @ngInject */
function AccountReviewCtrl($scope, $location) {
  $scope.nextStep = function () {
    $location.path('/initialsetup/adduser');
  };
}
