(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, AAUiModelService, AutoAttendantCeInfoModelService, AAModelService, AAValidationService, Notification) {

    var vm = this;
    vm.aaModel = {};

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
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
    }

    function activate() {
      vm.aaModel.aaRecord = AAModelService.getNewAARecord();
      vm.aaModel.aaRecordUUID = "";

      vm.ui = AAUiModelService.getUiModel();

      aaBuilderMainCtrl_saveAARecords = $scope.saveAARecords;

    }

    activate();

  }
})();
