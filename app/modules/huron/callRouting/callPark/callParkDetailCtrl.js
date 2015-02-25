(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .controller('CallParkDetailCtrl', CallParkDetailCtrl);

  /* @ngInject */
  function CallParkDetailCtrl($modalInstance, CallPark) {
    var vm = this;
    vm.callPark = {
      'retrievalPrefix': '*'
    };
    vm.options = {
      pattern: 'range',
      reversionPattern: 'owner'
    };
    vm.addCallPark = addCallPark;
    vm.addCallParkByRange = addCallParkByRange;

    function addCallParkByRange(callPark, rangeMin, rangeMax) {
      CallPark.createByRange(callPark, rangeMin, rangeMax)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          $modalInstance.dismiss();
        });
    }

    function addCallPark(callPark) {
      CallPark.create(callPark)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          $modalInstance.dismiss();
        });
    }
  }
})();
