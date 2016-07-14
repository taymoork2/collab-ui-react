(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseDeviceTypeCtrl', ChooseDeviceTypeCtrl);
  /* @ngInject */
  function ChooseDeviceTypeCtrl($stateParams) {
    var vm = this;

    vm.hideCancelButton = !$stateParams.wizard.showPlaces;
    vm.hideBackButton = !!$stateParams.wizard.showPlaces;

    vm.resetErrors = function () {
      vm.huronError = false;
      vm.cloudberryError = false;
    };

    vm.wizardData = $stateParams.wizard.state().data;
    vm.selectedDeviceType = null;

    vm.next = function () {
      $stateParams.wizard.next({
        deviceType: vm.selectedDeviceType,
        deviceName: vm.wizardData.deviceName
      }, vm.selectedDeviceType);
    };

    vm.cloudberry = function () {
      vm.resetErrors();
      if ($stateParams.wizard.state().data.isEntitledToRoomSystem) {
        vm.selectedDeviceType = 'cloudberry';
      } else {
        vm.selectedDeviceType = null;
        vm.cloudberryError = true;
      }
    };

    vm.huron = function () {
      vm.resetErrors();
      if ($stateParams.wizard.state().data.isEntitledToHuron) {
        vm.selectedDeviceType = 'huron';
      } else {
        vm.selectedDeviceType = null;
        vm.huronError = true;
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
