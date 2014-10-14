'use strict';

angular.module('Core')

.controller('DevicesCtrl', ['$scope',
  function($scope) {

    $scope.devices = [{
      model: 'SX10',
      qty: 15
    }, {
      model: 'DX80',
      qty: 38
    }, {
      model: 'MX300',
      qty: 3
    }];
  }
]);
