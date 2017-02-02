(function () {
  'use strict';

  angular.module('Core')
    .controller('ConfirmRoomDeviceOnlyCtrl', ConfirmRoomDeviceOnlyCtrl);
  /* @ngInject */
  function ConfirmRoomDeviceOnlyCtrl($stateParams) {
    var vm = this;

    vm.next = function () {
      $stateParams.wizard.next({});
    };
  }
})();
