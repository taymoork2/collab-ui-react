(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $state, $stateParams, $q, AAUiModelService,
    AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AutoAttendantCeService,
    AAValidationService, AANumberAssignmentService, AANotificationService, Authinfo, AACommonService, AAUiScheduleService, AACalendarService,
    AATrackChangeService, AADependencyService) {

    var vm = this;
    vm.overlayTitle = $translate.instant('autoAttendant.builderTitle');
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];
    vm.aaNameFocus = false;
    vm.canSave = false;
    vm.isAANameDefined = undefined;

    vm.setAANameFocus = setAANameFocus;
    vm.close = closePanel;
    vm.saveAARecords = saveAARecords;
    vm.canSaveAA = canSaveAA;
    vm.getSaveErrorMessages = getSaveErrorMessages;
    vm.selectAA = selectAA;
    vm.populateUiModel = populateUiModel;
    vm.removeNewStep = removeNewStep;
    vm.saveUiModel = saveUiModel;
    vm.setupTemplate = setupTemplate;
    vm.templateName = $stateParams.aaTemplate;
    vm.saveAANumberAssignmentWithErrorDetail = saveAANumberAssignmentWithErrorDetail;
    vm.areAssignedResourcesDifferent = areAssignedResourcesDifferent;
    vm.setLoadingDone = setLoadingDone;

    vm.save8To5Schedule = save8To5Schedule;
    vm.saveCeDefinition = saveCeDefinition;
    vm.delete8To5Schedule = delete8To5Schedule;

    vm.templateDefinitions = [{
      tname: 'Basic',
      actions: [{
        lane: 'openHours',
        actionset: ['say', 'runActionsOnInput']
      }]
    }, {
      tname: 'Custom',
      actions: [{
        lane: 'openHours',
        actionset: []
      }]
    }, {
      tname: 'BusinessHours',
      actions: [{
        lane: 'openHours',
        actionset: []
      }, {
        lane: 'closedHours',
        actionset: []
      }]
    }];

    setLoadingStarted();

    /////////////////////

    function setLoadingStarted() {
      vm.loading = true;
    }

    function setLoadingDone() {
      vm.loading = false;
    }

    function setAANameFocus() {
      vm.aaNameFocus = true;
      vm.canSave = true;
    }

    // Returns true if the provided assigned resources are different in size or in the passed-in field
    function areAssignedResourcesDifferent(aa1, aa2, tag) {

      // if we have a different number of resources, we definitely have a difference
      if (aa1.length !== aa2.length) {
        return true;
      } else {
        // otherwise, filter on the passed-in field and compare
        var a1 = _.pluck(aa1, tag);
        var a2 = _.pluck(aa2, tag);
        return (_.difference(a1, a2).length > 0 || _.difference(a2, a1).length > 0);
      }

    }

    // Save the phone number resources originally in the CE (used on exit with no save, and on save error)
    function unAssignAssigned() {
      // check to see if the local assigned list of resources is different than in CE info
      if (angular.isDefined(vm.aaModel.aaRecord) && areAssignedResourcesDifferent(vm.aaModel.aaRecord.assignedResources, vm.ui.ceInfo.getResources(), 'id')) {
        var ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
        return AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, ceInfo.getResources()).then(
          function (response) {
            return response;
          },
          function (response) {
            AANotificationService.error('autoAttendant.errorResetCMI');
            return $q.reject(response);
          }
        );
      } else {
        // no unassignment necessary - just return fulfilled promise
        var deferred = $q.defer();
        deferred.resolve([]);
        return deferred.promise;
      }
    }

    function closePanel() {
      unAssignAssigned().finally(function () {
        $state.go('huronfeatures');
      });

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
      if (angular.isUndefined(vm.aaModel.aaRecord.scheduleEventTypeMap)) {
        vm.aaModel.aaRecord.scheduleEventTypeMap = {};
      }

      if (angular.isDefined(vm.aaModel.aaRecord.scheduleEventTypeMap.holiday)) {
        vm.ui.isHolidays = true;
        vm.ui.holidaysValue = vm.aaModel.aaRecord.scheduleEventTypeMap.holiday;
      } else {
        vm.ui.isHolidays = false;
        if (angular.isUndefined(vm.ui.holidays)) {
          vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
          vm.ui.holidays.setType('MENU_WELCOME');
        }
      }

      if (angular.isDefined(vm.aaModel.aaRecord.scheduleEventTypeMap.closed)) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.isClosedHours = false;
        if (angular.isUndefined(vm.ui.closedHours)) {
          vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
          vm.ui.closedHours.setType('MENU_WELCOME');
        }
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
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays, vm.ui.holidaysValue);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'holidays');
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }

      AutoAttendantCeMenuModelService.updateDefaultActionSet(vm.aaModel.aaRecord, vm.ui.hasClosedHours);
    }

    // Set the numbers in CMI with error details (involves multiple saves in the AANumberAssignmentService service)
    // Notify the user of any numbers that failed
    function saveAANumberAssignmentWithErrorDetail(resources) {

      return AANumberAssignmentService.formatAAE164ResourcesBasedOnCMI(resources).then(function (fmtResources) {

        AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, fmtResources).then(
          function (response) {
            if (_.get(response, 'failedResources.length', false)) {
              AANotificationService.errorResponse(response, 'autoAttendant.errorFailedToAssignNumbers', {
                phoneNumbers: _.pluck(response.failedResources, 'id')
              });
            }
            return response;
          }
        );
      });
    }

    function updateCE(recNum) {
      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var updateResponsePromise = AutoAttendantCeService.updateCe(
        aaRecords[recNum].callExperienceURL,
        aaRecord);

      updateResponsePromise.then(
        function (response) {
          // update successfully
          aaRecords[recNum].callExperienceName = aaRecord.callExperienceName;
          aaRecords[recNum].assignedResources = angular.copy(aaRecord.assignedResources);
          vm.aaModel.ceInfos[recNum] = AutoAttendantCeInfoModelService.getCeInfo(aaRecords[recNum]);

          AACommonService.resetFormStatus();
          vm.canSave = false;

          if (AATrackChangeService.isChanged('AAName', aaRecord.callExperienceName)) {
            var scheduleId = aaRecord.scheduleId;
            var nameChangeEvent = {
              'type': 'AANameChange',
              'scheduleId': scheduleId,
              'newName': aaRecord.callExperienceName
            };
            AADependencyService.notifyAANameChange(nameChangeEvent);
            AATrackChangeService.track('AAName', aaRecord.callExperienceName);
          }

          AANotificationService.success('autoAttendant.successUpdateCe', {
            name: aaRecord.callExperienceName
          });

        },
        function (response) {
          AANotificationService.errorResponse(response, 'autoAttendant.errorUpdateCe', {
            name: aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status
          });
          unAssignAssigned();
        }
      );
      return updateResponsePromise;
    }

    function createCE() {
      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var ceUrlPromise = AutoAttendantCeService.createCe(aaRecord);
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

          AACommonService.resetFormStatus();
          vm.canSave = false;
          AATrackChangeService.track('AAName', aaRecord.callExperienceName);

          AANotificationService.success('autoAttendant.successCreateCe', {
            name: aaRecord.callExperienceName
          });

        },
        function (response) {
          AANotificationService.errorResponse(response, 'autoAttendant.errorCreateCe', {
            name: aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status
          });
          unAssignAssigned();
        }
      );
      return ceUrlPromise;
    }

    function removeNewStep(menu) {
      if (menu) {
        menu.entries = _.reject(menu.entries, function (entry) {
          // Remove New Step placeholder.  New Step has two respresentation in the UI model:
          // 1) When a New Step is added by an user, it is defined by a menuEntry with an empty
          // actions array in UI model.  It was stored as an empty menuEntry {} into
          // the CE definition.
          // 2) When an empty menuEntry {} is read from CE definition, it is translated into
          // the UI model as a menuEntry with an un-configured action in actions array and
          // action.name set to "".
          return angular.isDefined(entry.actions) &&
            (entry.actions.length === 0 ||
              (entry.actions.length === 1 && entry.actions[0].name.length === 0));
        });
      }
    }

    function saveAARecords() {

      var deferred = $q.defer();
      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var aaRecordUUID = vm.aaModel.aaRecordUUID;
      vm.ui.builder.ceInfo_name = vm.ui.builder.ceInfo_name.trim();
      if (!AAValidationService.isNameValidationSuccess(vm.ui.builder.ceInfo_name, aaRecordUUID)) {
        deferred.reject({
          statusText: '',
          status: 'VALIDATION_FAILURE'
        });
        return deferred.promise;
      }

      if (!AAValidationService.isRouteToValidationSuccess(vm.ui)) {
        deferred.reject({
          statusText: '',
          status: 'VALIDATION_FAILURE'
        });
        return deferred.promise;
      }

      vm.removeNewStep(vm.ui.openHours);
      vm.removeNewStep(vm.ui.closedHours);
      vm.removeNewStep(vm.ui.holidays);

      vm.saveUiModel();

      var recNum = 0;
      var isNewRecord = true;
      vm.canSave = true;

      if (aaRecordUUID.length > 0) {
        for (recNum = 0; recNum < aaRecords.length; recNum++) {
          if (AutoAttendantCeInfoModelService.extractUUID(aaRecords[recNum].callExperienceURL) === aaRecordUUID) {
            isNewRecord = false;
            vm.canSave = false;
            break;
          }
        }
      }

      if (isNewRecord) {
        return createCE();
      } else {
        // If a possible discrepancy was found between the phone number list in CE and the one stored in CMI
        // Try a complete save here and report error details
        if (vm.aaModel.possibleNumberDiscrepancy) {

          var currentlyShownResources = AutoAttendantCeInfoModelService.getCeInfo(aaRecord).getResources();

          return saveAANumberAssignmentWithErrorDetail(currentlyShownResources).then(function (assignmentResults) {

            return AANumberAssignmentService.formatAAExtensionResourcesBasedOnCMI(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, currentlyShownResources).then(function (resources) {

              updateCE(recNum);

            });

          });
        } else {
          return updateCE(recNum);
        }

      }
    }

    function canSaveAA() {
      if (AACommonService.isFormDirty()) {
        vm.canSave = true;
      } else if (vm.aaModel.possibleNumberDiscrepancy) {
        vm.canSave = true;
      }

      if (!AACommonService.isValid()) {
        vm.canSave = false;
      }

      return vm.canSave;
    }

    function getSaveErrorMessages() {

      var messages = vm.errorMessages.join('<br>');

      return messages;
    }

    function setupTemplate() {

      if (!vm.templateName) {
        return;
      }

      var specifiedTemplate = _.find(vm.templateDefinitions, {
        tname: vm.templateName
      });

      if (angular.isUndefined(specifiedTemplate) || angular.isUndefined(specifiedTemplate.tname) || specifiedTemplate.tname.length === 0) {
        AANotificationService.error('autoAttendant.errorInvalidTemplate', {
          template: vm.templateName
        });
        return;
      }

      if (angular.isUndefined(specifiedTemplate.actions) || specifiedTemplate.actions.length === 0) {
        AANotificationService.error('autoAttendant.errorInvalidTemplateDef', {
          template: vm.templateName
        });
        return;
      }

      _.forEach(specifiedTemplate.actions, function (action) {
        var uiMenu = vm.ui[action.lane];

        if (action.lane === "holidays") {
          vm.ui.isHolidays = true;
        }

        if (action.lane === "closedHours") {
          vm.ui.isClosedHours = true;
        }

        if (angular.isUndefined(action.actionset)) {
          AANotificationService.error('autoAttendant.errorInvalidTemplateDef', {
            template: vm.templateName
          });
          return;
        }

        _.forEach(action.actionset, function (actionset) {
          var menuEntry;
          var menuAction;
          if (actionset === 'runActionsOnInput') {
            menuEntry = AutoAttendantCeMenuModelService.newCeMenu();
            menuEntry.type = 'MENU_OPTION';

            var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            keyEntry.type = "MENU_OPTION";
            keyEntry.key = '0';
            var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
            keyEntry.addAction(emptyAction);
            menuEntry.entries.push(keyEntry);

          } else {
            menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            menuAction = AutoAttendantCeMenuModelService.newCeActionEntry(actionset, '');
            menuEntry.addAction(menuAction);
          }
          uiMenu.appendEntry(menuEntry);

        });
      });
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.getNewAARecord();
          vm.aaModel.aaRecordUUID = "";
          vm.isAANameDefined = false;
        } else {

          var aaRecord = _.find(vm.aaModel.aaRecords, {
            callExperienceName: aaName
          });

          if (angular.isDefined(aaRecord)) {
            AutoAttendantCeService.readCe(aaRecord.callExperienceURL).then(
              function (data) {
                vm.aaModel.aaRecord = data;
                vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(aaRecord.callExperienceURL);
                vm.populateUiModel();
                vm.isAANameDefined = true;
                AATrackChangeService.track('AAName', aaRecord.callExperienceName);
              },
              function (response) {
                AANotificationService.errorResponse(response, 'autoAttendant.errorReadCe', {
                  name: aaName,
                  statusText: response.statusText,
                  status: response.status
                });
              }
            );
            return;
          } else {
            AANotificationService.error('autoAttendant.errorReadCe', {
              name: aaName
            });
          }
        }
      }
      vm.populateUiModel();
      vm.setupTemplate();
    }

    function save8To5Schedule(aaName) {
      return AAUiScheduleService.create8To5Schedule(aaName).then(
        function (scheduleId) {
          vm.ui.ceInfo.scheduleId = scheduleId;
          vm.ui.hasClosedHours = true;
        },
        function (error) {
          AANotificationService.errorResponse(error, 'autoAttendant.errorCreateSchedule', {
            name: aaName,
            statusText: error.statusText,
            status: error.status
          });
          return $q.reject('SAVE_SCHEDULE_FAILURE');
        }
      );
    }

    function saveCeDefinition() {
      return vm.saveAARecords().then(
        function () {
          // Sucessfully created new CE Definition, leave Name-assignment page
          vm.isAANameDefined = true;
        },
        function (error) {
          return $q.reject('CE_SAVE_FAILURE');
        }
      );
    }

    function delete8To5Schedule(error) {
      if (error === 'CE_SAVE_FAILURE') {
        AACalendarService.deleteCalendar(vm.ui.ceInfo.scheduleId).catch(
          function (response) {
            AANotificationService.errorResponse(response, 'autoAttendant.errorDeletePredefinedSchedule', {
              name: vm.ui.ceInfo.name,
              statusText: error.statusText,
              status: error.status
            });
          }
        );
      }
    }

    $scope.$on('AANameCreated', function () {
      if (vm.ui.aaTemplate && vm.ui.aaTemplate === 'BusinessHours') {
        vm.save8To5Schedule(vm.ui.ceInfo.name).then(vm.saveCeDefinition).catch(vm.delete8To5Schedule);
      } else {
        vm.saveAARecords().then(function () {
          // Sucessfully created new CE Definition, time to move from Name-assignment page
          // to the overlay panel.
          vm.isAANameDefined = true;
        });
      }
    });

    function activate() {
      var aaName = $stateParams.aaName;
      AAUiModelService.initUiModel();
      AACommonService.resetFormStatus();

      vm.ui = AAUiModelService.getUiModel();
      vm.ui.ceInfo = {};
      vm.ui.ceInfo.name = aaName;
      vm.ui.builder = {};
      vm.ui.aaTemplate = $stateParams.aaTemplate;

      // Define vm.ui.builder.ceInfo_name for editing purpose.
      vm.ui.builder.ceInfo_name = angular.copy(vm.ui.ceInfo.name);

      AutoAttendantCeInfoModelService.getCeInfosList().finally(function () {
        vm.aaModel = AAModelService.getAAModel();
        vm.aaModel.aaRecord = undefined;
        vm.selectAA(aaName);
      });

    }

    activate();
  }
})();
