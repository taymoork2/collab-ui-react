'use strict';

angular.module('Core')

.controller('LicensesCtrl', ['$scope',
  function($scope) {

    $scope.licenses = {
      total: 1500,
      used: 1125,
      unlicensed: 214,
      domain: 'companyname.com'
    };

  }
]);
