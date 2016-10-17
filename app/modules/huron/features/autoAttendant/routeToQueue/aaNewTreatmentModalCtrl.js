(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AANewTreatmentModalCtrl', AANewTreatmentModalCtrl);

  /* @ngInject */
  function AANewTreatmentModalCtrl($modalInstance, $translate, $scope, AACommonService, AutoAttendantCeMenuModelService, AAUiModelService, aa_schedule, aa_menu_id, aa_index, aa_key_index) {
    var vm = this;

    vm.cancel = cancel;
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.destinationOptions = [{
      label: $translate.instant('autoAttendant.destinations.Disconnect')
    }, {
      label: $translate.instant('autoAttendant.destinations.HuntGroup')
    }, {
      label: $translate.instant('autoAttendant.destinations.Queue')
    }, {
      label: $translate.instant('autoAttendant.destinations.User')
    }, {
      label: $translate.instant('autoAttendant.destinations.Voicemail')
    }, {
      label: $translate.instant('autoAttendant.destinations.ExternalPhone')
    }, {
      label: $translate.instant('autoAttendant.destinations.AutoAttendant')
    }];
    vm.destination = vm.destinationOptions[0];
    vm.selected = '';
    vm.minute = '15';
    vm.menuEntry = undefined;

    vm.isSaveEnabled = isSaveEnabled;
    //////////////////////////////////

    function cancel() {
      $modalInstance.close();
    }

    //the queueSettings save gets linked to main save
    function isSaveEnabled() {
      return AACommonService.isValid();
    }

    function populateMaxTime() {
      vm.minutes = [];
      _.times(60, function (i) {
        vm.minutes.push({
          index: i,
          label: i + 1
        });
      });
      vm.minute = vm.minutes[14];
    }

    //get queueSettings menuEntry -> inner menu entry type (moh, initial, periodic...)
    function setUpEntry() {
      if ($scope.keyIndex && $scope.menuId) { //came from a phone menu
        var phMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        vm.menuEntry = phMenu.entries[$scope.keyIndex];
      } else { //came from a route call
        var ui = AAUiModelService.getUiModel();
        var rcMenu = ui[$scope.schedule];
        vm.menuEntry = rcMenu.entries[$scope.index];
      }
    }

    function populateScope() {
      $scope.schedule = aa_schedule;
      $scope.index = aa_index;
      $scope.menuId = aa_menu_id;
      $scope.keyIndex = aa_key_index;
    }

    function initializeView() {
      populateMaxTime();
    }

    function populateUiModel() {
      populateScope();
      setUpEntry();
      initializeView();
    }

    function activate() {
      populateUiModel();
    }
    activate();
  }
})();
