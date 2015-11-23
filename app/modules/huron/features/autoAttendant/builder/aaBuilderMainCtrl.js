(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $state, $stateParams, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AutoAttendantCeService, AAValidationService, AANumberAssignmentService, Notification, Authinfo) {
    var vm = this;
    vm.overlayTitle = $translate.instant('autoAttendant.builderTitle');
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];
    vm.aaNameFocus = false;

    vm.setAANameFocus = setAANameFocus;
    vm.close = closePanel;
    vm.saveAARecords = saveAARecords;
    vm.canSaveAA = canSaveAA;
    vm.getSaveErrorMessages = getSaveErrorMessages;
    vm.selectAA = selectAA;
    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    $scope.saveAARecords = saveAARecords;

    /////////////////////

    function setAANameFocus() {
      vm.aaNameFocus = true;
    }

    function unAssignAssigned() {
      if (vm.aaModel.aaRecord.assignedResources.length < vm.ui.ceInfo.getResources().length) {
        var ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
        AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, ceInfo).then(
          function (response) {},
          function (response) {
            Notification.error('autoAttendant.errorResetCMI');
          }
        );
      }
    }

    function closePanel() {
      unAssignAssigned();

      $state.go('huronfeatures');
    }

    function removeNumberAttribute(resources) {
      for (var i = 0; i < resources.length; i++) {
        delete resources[i].number;
      }

    }

    function populateUiModel() {
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      vm.ui.openHours = vm.ui.openHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'openHours');
      vm.ui.closedHours = vm.ui.closedHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
      vm.ui.holidays = vm.ui.holidays || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'holidays');
      vm.ui.isOpenHours = true;
      if (!angular.isDefined(vm.ui.openHours)) {
        vm.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.openHours.setType('MENU_WELCOME');
      }

      if (angular.isDefined(vm.ui.closedHours)) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.isClosedHours = false;
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (angular.isDefined(vm.ui.holidays)) {
        vm.ui.isHolidays = true;
      } else {
        vm.ui.isHolidays = false;
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }
    }

    function saveUiModel() {
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        if (angular.isDefined(vm.ui.builder.ceInfo_name) && (vm.ui.builder.ceInfo_name.length > 0)) {
          vm.ui.ceInfo.setName(angular.copy(vm.ui.builder.ceInfo_name));
        }
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
      if (vm.ui.isOpenHours && angular.isDefined(vm.ui.openHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'openHours', vm.ui.openHours);
      }
      if (vm.ui.isClosedHours && angular.isDefined(vm.ui.closedHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'closedHours', vm.ui.closedHours);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (vm.ui.isHolidays && angular.isDefined(vm.ui.holidays)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'holidays');
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }
    }

    function saveAARecords() {

      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var aaRecordUUID = vm.aaModel.aaRecordUUID;
      vm.ui.builder.ceInfo_name = vm.ui.builder.ceInfo_name.trim();
      if (!AAValidationService.isNameValidationSuccess(vm.ui.builder.ceInfo_name, aaRecordUUID)) {
        return;
      }

      vm.saveUiModel();

      var i = 0;
      var isNewRecord = true;
      if (aaRecordUUID.length > 0) {
        for (i = 0; i < aaRecords.length; i++) {
          if (AutoAttendantCeInfoModelService.extractUUID(aaRecords[i].callExperienceURL) === aaRecordUUID) {
            isNewRecord = false;
            break;
          }
        }
      }

      // Workaround: remove resource.number attribute before sending the ceDefinition to CES
      //
      var _aaRecord = angular.copy(aaRecord);
      removeNumberAttribute(_aaRecord.assignedResources);
      //

      if (isNewRecord) {
        var ceUrlPromise = AutoAttendantCeService.createCe(_aaRecord);
        ceUrlPromise.then(
          function (response) {
            // create successfully
            var newAaRecord = {};
            newAaRecord.callExperienceName = aaRecord.callExperienceName;
            newAaRecord.assignedResources = angular.copy(aaRecord.assignedResources);
            newAaRecord.callExperienceURL = response.callExperienceURL;
            aaRecords.push(newAaRecord);
            vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(response.callExperienceURL);
            vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(newAaRecord));
            Notification.success('autoAttendant.successCreateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorCreateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
            unAssignAssigned();
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
            Notification.success('autoAttendant.successUpdateCe', {
              name: aaRecord.callExperienceName
            });

          },
          function (response) {
            Notification.error('autoAttendant.errorUpdateCe', {
              name: aaRecord.callExperienceName,
              statusText: response.statusText,
              status: response.status
            });
            unAssignAssigned();
          }
        );
      }
    }

    function canSaveAA() {
      var canSave = true;
      return canSave;
    }

    function getSaveErrorMessages() {

      var messages = vm.errorMessages.join('<br>');

      return messages;
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.getNewAARecord();
          vm.aaModel.aaRecordUUID = "";
        } else {
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
              // vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
              AutoAttendantCeService.readCe(vm.aaModel.aaRecords[i].callExperienceURL).then(
                function (data) {
                  vm.aaModel.aaRecord = data;
                  // Workaround for reading the dn number: by copying it from aaRecords[i], until
                  // dn number is officialy stored in ceDefintion.
                  vm.aaModel.aaRecord.assignedResources = angular.copy(vm.aaModel.aaRecords[i].assignedResources);
                  vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(vm.aaModel.aaRecords[i].callExperienceURL);
                  //
                  vm.populateUiModel();
                },
                function (response) {
                  Notification.error('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  });
                }
              );
              return;
            }
          }
        }
      }
      vm.populateUiModel();
    }

    function activate() {

      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();
      vm.aaModel.aaRecord = undefined;
      AAUiModelService.initUiModel();
      vm.ui = AAUiModelService.getUiModel();
      vm.ui.ceInfo = {};
      vm.ui.ceInfo.name = aaName;
      vm.ui.builder = {};
      // Define vm.ui.builder.ceInfo_name for editing purpose.
      vm.ui.builder.ceInfo_name = angular.copy(vm.ui.ceInfo.name);

      AutoAttendantCeInfoModelService.getCeInfosList().then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });
    }

    activate();

  }
})();
