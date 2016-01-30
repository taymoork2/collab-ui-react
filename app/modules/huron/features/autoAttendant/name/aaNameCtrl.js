(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, AAUiModelService, AutoAttendantCeInfoModelService, AAModelService, AAValidationService, Notification) {

    var vm = this;
    vm.aaRecord = {};

    vm.ui = {};
    vm.saveAARecord = saveAARecord;

    // exposed checkNameEntry and saveUiModel for unit tests
    vm.saveUiModel = saveUiModel;

    var name = "";
    var aaBuilderMainCtrl_saveAARecords;

    /////////////////////

    function saveAARecord() {

      if (!AAValidationService.isNameValidationSuccess(vm.name, '')) {
        return;
      }

      saveUiModel();

      aaBuilderMainCtrl_saveAARecords();

    }

    function saveUiModel() {
      vm.ui.ceInfo.name = vm.name;
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        vm.ui.builder.ceInfo_name = vm.ui.ceInfo.getName();
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaRecord, vm.ui.ceInfo);
      }
    }

    function activate() {
      vm.aaRecord = AAModelService.getNewAARecord();

      vm.ui = AAUiModelService.getUiModel();

      aaBuilderMainCtrl_saveAARecords = $scope.saveAARecords;

    }

    activate();

  }
})();
