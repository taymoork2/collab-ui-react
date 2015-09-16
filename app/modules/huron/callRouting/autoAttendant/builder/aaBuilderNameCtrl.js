/**
 * Created by chris on 8/24/15.
 */
(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, $q, $translate, $stateParams, AutoAttendantCeMenuModelService, AutoAttendantCeInfoModelService, AutoAttendantCeService, AAModelService, Notification) {

    var vm = this;
    vm.aaModel = {};

    vm.errorMessages = [];
    vm.ui = {};
    var aaname = '';

    $scope.submit = function () {

      vm.aaModel.aaRecord.callExperienceName = vm.ui.ceInfo.getName();

      if (!checkNameEntry(vm.ui.ceInfo.getName())) {
        return;
      }

      vm.aaModel.aaRecord.assignedResources = [{
        "id": parseInt(Math.random() * 10000000, 10),
        "type": "directoryNumber",
        "trigger": "incomingCall"
      }];

      var actions = [{
        "play": {
          "description": "Play welcome message",
          "url": "http://s3.amazonaws.com/ivr-stuff/file0.avi"
        }
      }];

      var actionSet = {
        "name": "regularOpenActions",
        "actions": actions
      };

      vm.aaModel.aaRecord.actionSets = [];
      vm.aaModel.aaRecord.actionSets.push(actionSet);

      var ceUrlPromise = AutoAttendantCeService.createCe(vm.aaModel.aaRecord);
      ceUrlPromise.then(
        function (response) {
          // create successfully

          Notification.notify([$translate.instant('autoAttendant.successCreateCe', {
            name: vm.aaModel.aaRecord.callExperienceName
          })], 'success');

          vm.aaModel.aaRecords.push(vm.aaModel.aaRecord);

          vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord));

          vm.aaModel.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

        },
        function (response) {
          Notification.notify([$translate.instant('autoAttendant.errorCreateCe', {
            name: vm.aaModel.aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status
          })], 'error');
        }
      );

    };

    function checkNameEntry(aaNameToTest) {
      if (angular.isUndefined(aaNameToTest) || aaNameToTest.length === 0) {
        Notification.notify($translate.instant('autoAttendant.invalidBuilderNameMissing'));
        return false;
      }

      if (checkForDups(aaNameToTest)) {
        return false;
      }

      return true;

    }

    function checkForDups(aaNameToTest) {

      // AA name unique on create
      var isNameInUse = false;

      isNameInUse = vm.aaModel.aaRecords.some(function (record) {
        return record.callExperienceName === aaNameToTest;
      });

      if (isNameInUse) {
        Notification.notify($translate.instant('autoAttendant.invalidBuilderNameNotUnique'));
        return true;
      }

      return false;
    }

    this.listAutoAttendants = function () {
      vm.aaModel.dataReadyPromise = AutoAttendantCeService.listCes();
      vm.aaModel.dataReadyPromise.then(
        function (data) {
          // read successfully
          vm.aaModel.aaRecords = data;

          //var promises = [];
          //for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
          //var resources = vm.aaModel.aaRecords[i].assignedResources;
          //for (var j = 0; j < resources.length; j++) {
          //  promises[promises.length] = setDirectoryNumber(resources[j]);
          // For testapp:
          // resources[j].setNumber(SystemService.getResourceValue(resources[j].getId()));
          // }
          // }

          // $q.all(promises).then(
          //  function (result) {
          vm.aaModel.ceInfos = AutoAttendantCeInfoModelService.getAllCeInfos(vm.aaModel.aaRecords);
          // }
          //);
        },
        function (response) {
          if (response.status != 404) {
            Notification.notify([$translate.instant('autoAttendant.errorListCes', {
              statusText: response.statusText,
              status: response.status
            })], 'error');
          }
        }
      );
    };

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.aaModel.ceInfos = [];
      vm.aaModel.ceInfo = {};

      vm.aaModel.aaRecord = {};
      vm.aaModel.aaRecord = AAModelService.newAARecord();

      $scope.aa = {};
      $scope.aa.modal = {};
      vm.ui = $scope.aa.modal;

      vm.listAutoAttendants();

      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

    }

    activate();
  }
})();
