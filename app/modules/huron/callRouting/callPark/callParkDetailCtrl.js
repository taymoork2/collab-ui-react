(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .controller('CallParkDetailCtrl', CallParkDetailCtrl);

  /* @ngInject */
  function CallParkDetailCtrl($scope, $modalInstance, CallPark) {
    var vm = this;
    vm.callPark = {
      'retrievalPrefix': '*'
    };
    vm.options = {
      pattern: 'range',
      reversionPattern: 'owner'
    };

    $scope.addCallParkByRange = function (callPark, rangeMin, rangeMax) {
      CallPark.createByRange(callPark, rangeMin, rangeMax)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          $modalInstance.dismiss();
        });
    };

    $scope.addCallPark = function (callPark) {
      CallPark.create(callPark)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          $modalInstance.dismiss();
        });
    };
  }
})();
