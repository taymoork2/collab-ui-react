(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $stateParams, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeService, Notification) {
    var vm = this;
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];

    vm.saveAARecords = saveAARecords;
    vm.canSaveAA = canSaveAA;
    vm.getSaveErrorMessages = getSaveErrorMessages;

    var aaName = {};

    /////////////////////

    function updateCeInfos(ceInfos, ceInfo) {
      for (var i = 0; i < ceInfos.length; i++) {
        if (ceInfos[i].getName() === ceInfo.getName()) {
          break;
        }
      }

      if (i === ceInfos.length) {
        ceInfos.push(ceInfo);
      }

      return i;
    }

    function removeNumberAttribute(resources) {
      for (var i = 0; i < resources.length; i++) {
        delete resources[i].number;
      }

    }

    function saveAARecords() {

      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      for (var i = 0; i < aaRecords.length; i++) {
        if (aaRecords[i].callExperienceName === aaRecord.callExperienceName) {
          break;
        }
      }

      // Workaround: remove resource.number attribute before sending the ceDefinition to CES
      //
      var _aaRecord = angular.copy(aaRecord);
      removeNumberAttribute(_aaRecord.assignedResources);
      //

      if (i === aaRecords.length) {
        var ceUrlPromise = AutoAttendantCeService.createCe(_aaRecord);
        ceUrlPromise.then(
          function (response) {
            // create successfully
            var newAaRecord = {};
            newAaRecord.callExperienceName = aaRecord.callExperienceName;
            newAaRecord.assignedResources = angular.copy(aaRecord.assignedResources);
            newAaRecord.callExperienceURL = response.callExperienceURL;
            aaRecords.push(newAaRecord);
            vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(newAaRecord));
            Notification.notify([$translate.instant('autoAttendant.successCreateCe', {
              name: aaRecord.callExperienceName
            })], 'success');
          },
          function (response) {
            Notification.notify([$translate.instant('autoAttendant.errorCreateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            })], 'error');
          }
        );
      } else {
        var updateResponsePromise = AutoAttendantCeService.updateCe(
          aaRecords[i].callExperienceURL,
          _aaRecord);

        updateResponsePromise.then(
          function (response) {
            // update successfully
            aaRecords[i].callExperienceName = aaRecord.callExperienceName;
            aaRecords[i].assignedResources = angular.copy(aaRecord.assignedResources);
            vm.aaModel.ceInfos[i] = AutoAttendantCeInfoModelService.getCeInfo(aaRecords[i]);
            Notification.notify([$translate.instant('autoAttendant.successUpdateCe', {
              name: aaRecord.callExperienceName
            })], 'success');
          },
          function (response) {
            Notification.notify([$translate.instant('autoAttendant.errorUpdateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            })], 'error');
          }
        );
      }
    }

    function canSaveAA() {
      vm.errorMessages = [];
      if (angular.isUndefined(vm.ui.ceInfo)) {
        return false;
      }

      var canSave = true;

      // AA name is missing
      if (angular.isUndefined(vm.ui.ceInfo.getName()) || vm.ui.ceInfo.getName().length === 0) {
        vm.errorMessages.push($translate.instant('autoAttendant.invalidNameMissing'));
        canSave = false;
      } else if ($stateParams.aaName === '') {
        // AA name unique on create
        var isNameInUse = false;
        isNameInUse = vm.aaModel.aaRecords.some(function (record) {
          return record.callExperienceName === vm.ui.ceInfo.getName();
        });
        if (isNameInUse) {
          vm.errorMessages.push($translate.instant('autoAttendant.invalidNameNotUnique'));
          canSave = false;
        }
      }

      // Custom present but not configured
      var menuEntry;
      if (vm.ui.showCustomMenu && angular.isDefined(vm.ui.customMenu)) {
        menuEntry = vm.ui.customMenu.entries[0];
        if (angular.isUndefined(menuEntry) || !menuEntry.isConfigured) {
          vm.errorMessages.push($translate.instant('autoAttendant.invalidCustomMenuIncomplete'));
          canSave = false;
        }
      }

      // Menu present but not configured
      if (vm.ui.showOptionMenu && angular.isDefined(vm.ui.optionMenu)) {
        menuEntry = vm.ui.optionMenu.headers[0]; // annoucement
        if (angular.isUndefined(menuEntry) || !menuEntry.isConfigured) {
          vm.errorMessages.push($translate.instant('autoAttendant.invalidMenuAnnoucementMissing'));
          canSave = false;
        }
        menuEntry = vm.ui.optionMenu.headers[1]; //invalid input
        if (angular.isUndefined(menuEntry) || !menuEntry.isConfigured) {
          vm.errorMessages.push($translate.instant('autoAttendant.invalidMenuDefaultMissing'));
          canSave = false;
        }

        // at least one menu option is required
        var isOneMenuOptionConfigured = false;
        isOneMenuOptionConfigured = vm.ui.optionMenu.entries.some(function (entry) {
          return angular.isDefined(entry) && entry.isConfigured;
        });
        if (!isOneMenuOptionConfigured) {
          vm.errorMessages.push($translate.instant('autoAttendant.invalidMenuMinimumOption'));
          canSave = false;
        }
      }

      return canSave;
    }

    function getSaveErrorMessages() {
      var messages = vm.errorMessages.join('<br>');

      return messages;
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();

      vm.aaModel.aaRecord = AAModelService.newAARecord();

      $scope.aa = {};
      $scope.aa.modal = {};
      vm.ui = $scope.aa.modal;
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

    }

    activate();

  }
})();
