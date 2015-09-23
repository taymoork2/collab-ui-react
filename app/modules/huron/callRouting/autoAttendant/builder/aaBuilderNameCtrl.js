/**
 * Created by chris on 8/24/15.
 */
(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, $translate, AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeService, AAModelService, Notification) {

    var vm = this;
    vm.aaModel = {};

    vm.ui = {};
    vm.saveAARecord = saveAARecord;

    var name = "";

    function saveAARecord() {

      vm.aaModel.aaRecord.callExperienceName = vm.name;

      if (!checkNameEntry(vm.name)) {
        return;
      }

      // Until the backend supports the adding of records with only a name we need to mock up a phone number.

      vm.aaModel.aaRecord.assignedResources = [{
        "id": parseInt(Math.random() * 10000000, 10),
        "type": "directoryNumber",
        "trigger": "incomingCall"
      }];

      vm.aaModel.aaRecord.actionSets = [];
      vm.aaModel.aaRecord.actionSets.push({});

      var ceUrlPromise = AutoAttendantCeService.createCe(vm.aaModel.aaRecord);
      ceUrlPromise.then(
        function (response) {
          // create successfully

          Notification.success($translate.instant('autoAttendant.successCreateCe', {
            name: vm.aaModel.aaRecord.callExperienceName
          }));

          vm.aaModel.aaRecords.push(vm.aaModel.aaRecord);

          vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord));

          vm.aaModel.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

          vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

        },
        function (response) {
          Notification.error($translate.instant('autoAttendant.errorCreateCe', {
            name: vm.aaModel.aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status
          }));
        }
      );

    }

    function checkNameEntry(aaNameToTest) {
      if (angular.isUndefined(aaNameToTest) || aaNameToTest.length === 0) {
        Notification.error($translate.instant('autoAttendant.invalidBuilderNameMissing'));
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
        Notification.error($translate.instant('autoAttendant.invalidBuilderNameNotUnique'));
        return true;
      }

      return false;
    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.aaModel.aaRecord = {};
      vm.aaModel.aaRecord = AAModelService.newAARecord();

      vm.ui = AAUiModelService.getCeInfo();

    }

    activate();

  }
})();
