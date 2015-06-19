(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AutoAttendantMenuCtrl', AutoAttendantMenuCtrl);

  /* @ngInject */
  function AutoAttendantMenuCtrl($scope, $stateParams, $translate, AutoAttendantCeService,
    AutoAttendantCeMenuModelService, AutoAttendantCeInfoModelService,
    AAModelService, Notification) {

    var vm = this;
    vm.aaModel = {};
    vm.ui = {};
    vm.ui.ceInfo = {};
    vm.ui.optionMenu = {};
    vm.ui.welcomeMenu = {};
    vm.ui.customMenu = {};

    vm.ui.showOptionMenu = false;
    vm.ui.showCustomMenu = false;

    /////////////////////

    function addWelcomeMenu() {
      if (angular.isUndefined(vm.ui.welcomeMenu) || vm.ui.welcomeMenu == null) {
        vm.ui.welcomeMenu = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.welcomeMenu.setType('MENU_WELCOME');
        // vm.welcomeMenu.addEntry(AutoAttendantCeMenuModelService.newCeMenuEntry());
      }
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AutoAttendantCeMenuModelService.newAARecord();
        } else {
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
              // vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
              AutoAttendantCeService.readCe(
                vm.aaModel.aaRecords[i].callExperienceURL).then(
                function (data) {
                  vm.aaModel.aaRecord = data;

                  // Workaround for reading the dn number: by copying it from aaRecords[i], until
                  // dn number is officialy stored in ceDefintion.
                  vm.aaModel.aaRecord.assignedResources = angular.copy(vm.aaModel.aaRecords[i].assignedResources);
                  //

                  vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
                  vm.ui.customMenu = vm.ui.customMenu || AutoAttendantCeMenuModelService.getCustomMenu(vm.aaModel.aaRecord, 'regularOpenActions');
                  vm.ui.welcomeMenu = vm.ui.welcomeMenu || AutoAttendantCeMenuModelService.getWelcomeMenu(vm.aaModel.aaRecord, 'regularOpenActions');
                  vm.ui.optionMenu = vm.ui.optionMenu || AutoAttendantCeMenuModelService.getOptionMenu(vm.aaModel.aaRecord, 'regularOpenActions');
                  if (angular.isUndefined(vm.ui.welcomeMenu)) {
                    addWelcomeMenu();
                  }
                  if (angular.isDefined(vm.ui.optionMenu)) {
                    vm.ui.showOptionMenu = true;
                  }
                  if (angular.isDefined(vm.ui.customMenu)) {
                    vm.ui.showCustomMenu = true;
                  }
                },
                function (response) {
                  Notification.notify([$translate.instant('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  })], 'error');
                });
              return;
            }
          }
        }
      }
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      vm.ui.customMenu = vm.ui.customMenu || AutoAttendantCeMenuModelService.getCustomMenu(vm.aaModel.aaRecord, 'regularOpenActions');
      vm.ui.welcomeMenu = vm.ui.welcomeMenu || AutoAttendantCeMenuModelService.getWelcomeMenu(vm.aaModel.aaRecord, 'regularOpenActions');
      vm.ui.optionMenu = vm.ui.optionMenu || AutoAttendantCeMenuModelService.getOptionMenu(vm.aaModel.aaRecord, 'regularOpenActions');
      if (angular.isUndefined(vm.ui.welcomeMenu)) {
        addWelcomeMenu();
      }
      if (angular.isDefined(vm.ui.optionMenu)) {
        vm.ui.showOptionMenu = true;
      }
      if (angular.isDefined(vm.ui.customMenu)) {
        vm.ui.showCustomMenu = true;
      }
    }

    function activate() {
      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = $scope.aa.modal;

      vm.aaModel.dataReadyPromise.then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });
    }

    activate();
  }
})();
