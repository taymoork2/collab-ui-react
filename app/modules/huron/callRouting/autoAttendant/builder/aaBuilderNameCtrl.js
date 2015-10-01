(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, AAUiModelService, AutoAttendantCeInfoModelService, AAModelService, Notification) {

    var vm = this;
    vm.aaModel = {};

    vm.ui = {};
    vm.saveAARecord = saveAARecord;

    // exposed checkNameEntry and saveUiModel for unit tests
    vm.checkNameEntry = checkNameEntry;
    vm.saveUiModel = saveUiModel;

    var name = "";
    var aaBuilderMainCtrl_saveAARecords;

    /////////////////////

    function saveAARecord() {

      if (!checkNameEntry(vm.name)) {
        return;
      }

      saveUiModel();

      aaBuilderMainCtrl_saveAARecords();

    }

    function saveUiModel() {
      vm.aaModel.aaRecord.callExperienceName = vm.name;

      vm.aaModel.aaRecord.assignedResources = [];

      vm.aaModel.aaRecord.actionSets = [];
      vm.aaModel.aaRecord.actionSets.push({});

      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }

    }

    function checkNameEntry(aaNameToTest) {
      if (angular.isUndefined(aaNameToTest) || aaNameToTest.length === 0) {
        Notification.error('autoAttendant.invalidBuilderNameMissing');
        return false;
      }

      if (checkForDups(aaNameToTest)) {
        return false;
      }

      return true;

    }

    function checkForDups(aaNameToTest) {

      // AA name unique on create
      var isNameInUse;
      isNameInUse = vm.aaModel.ceInfos.some(function (record) {
        return record.name === aaNameToTest;
      });

      if (isNameInUse) {
        Notification.error('autoAttendant.invalidBuilderNameNotUnique');
        return true;
      }

      return false;
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.aaModel.aaRecord = {};
      vm.aaModel.aaRecord = AAModelService.newAARecord();

      vm.ui = AAUiModelService.getCeInfo();

      aaBuilderMainCtrl_saveAARecords = $scope.saveAARecords;

    }

    activate();

  }
})();
