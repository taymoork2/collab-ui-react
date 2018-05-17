(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseDeviceTypeCtrl', ChooseDeviceTypeCtrl);
  /* @ngInject */
  function ChooseDeviceTypeCtrl($stateParams) {
    var vm = this;

    vm.resetErrors = function () {
      vm.huronError = false;
      vm.cloudberryError = false;
    };

    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.showPersonal = wizardData.showPersonal;
    vm.selectedDeviceType = null;
    vm.isLoading = false;

    vm.isNewPlaceFlow = function () {
      return wizardData.function !== 'addDevice';
    };

    vm.hideCancelButton = vm.isNewPlaceFlow() || vm.showPersonal;
    vm.hideBackButton = !vm.isNewPlaceFlow() && !vm.showPersonal;

    vm.next = function () {
      if (vm.selectedDeviceType) {
        vm.isLoading = true;
        $stateParams.wizard.next({
          account: {
            deviceType: vm.selectedDeviceType,
          },
        }, vm.selectedDeviceType);
      }
    };

    vm.cloudberry = function () {
      vm.resetErrors();
      if (wizardData.isEntitledToRoomSystem) {
        vm.selectedDeviceType = 'cloudberry';
      } else {
        vm.selectedDeviceType = null;
        vm.cloudberryError = true;
      }
    };

    vm.huron = function () {
      vm.resetErrors();
      if (wizardData.isEntitledToHuron) {
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
