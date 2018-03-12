(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function AABuilderMainCtrl($element, $modalStack, $q, $rootScope, $scope, $state, $stateParams, $translate, AACalendarService, AACommonService,
    AADependencyService, AAMediaUploadService, AAMetricNameService, AAModelService, AANotificationService, AANumberAssignmentService, AARestModelService,
    AATrackChangeService, AAUiModelService, AAUiScheduleService, AAValidationService, AccessibilityService, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AutoAttendantHybridCareService, AutoAttendantCeService, AutoAttendantLocationService, Analytics, Authinfo, DoRestService, FeatureToggleService, ServiceSetup) {
    var vm = this;
    vm.isWarn = false;
    vm.overlayTitle = $translate.instant('autoAttendant.builderTitle');
    vm.aaModel = {};
    vm.ui = {};
    vm.errorMessages = [];
    vm.aaNameFocus = false;
    vm.canSave = false;
    vm.isAANameDefined = undefined;
    vm.loading = true;

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
    vm.populateRoutingLocation = populateRoutingLocation;
    vm.getSystemTimeZone = getSystemTimeZone;
    vm.getTimeZoneOptions = getTimeZoneOptions;
    vm.save8To5Schedule = save8To5Schedule;
    vm.saveCeDefinition = saveCeDefinition;
    vm.delete8To5Schedule = delete8To5Schedule;
    vm.evalKeyPress = evalKeyPress;

    vm.templateDefinitions = [{
      tname: 'Basic',
      actions: [{
        lane: 'openHours',
        actionset: ['play', 'runActionsOnInput'],
      }],
    }, {
      tname: 'Custom',
      actions: [{
        lane: 'openHours',
        actionset: [],
      }],
    }, {
      tname: 'BusinessHours',
      actions: [{
        lane: 'openHours',
        actionset: [],
      }, {
        lane: 'closedHours',
        actionset: [],
      }],
    }];

    var DEFAULT_TZ = {
      id: 'America/Los_Angeles',
      label: $translate.instant('timeZones.America/Los_Angeles'),
    };

    $scope.$on('$locationChangeStart', function (event) {
      var top = $modalStack.getTop();
      if (top) {
        $modalStack.dismiss(top.key);
        event.preventDefault();
      }
    });


    /////////////////////

    function setLoadingDone() {
      vm.loading = false;
      sendMetrics('load');
    }

    function sendMetrics(metric) {
      if (vm.isAANameDefined && !_.isUndefined(metric)) {
        Analytics.trackEvent(AAMetricNameService.BUILDER_PAGE, {
          type: metric,
        });
      }
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
        var a1 = _.map(aa1, tag);
        var a2 = _.map(aa2, tag);
        return _.difference(a1, a2).length !== 0;
      }
    }

    // Save the phone number resources originally in the CE (used on exit with no save, and on save error)
    function unAssignAssigned() {
      // check to see if the local assigned list of resources is different than in CE info
      if (!_.isUndefined(vm.aaModel.aaRecord) && (areAssignedResourcesDifferent(vm.aaModel.aaRecord.assignedResources, vm.ui.ceInfo.getResources(), 'id')
              || areAssignedResourcesDifferent(vm.aaModel.aaRecord.assignedResources, vm.ui.ceInfo.getResources(), 'uuid'))) {
        var ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
        return AANumberAssignmentService.setAANumberAssignment(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, ceInfo.getResources()).then(
          function () {
            return AANumberAssignmentService.getAANumberAssignments(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID).then(function (numbers) {
              return numbers;
            });
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
      AAMediaUploadService.resetResources();
      var aaRecord = vm.aaModel.aaRecord;
      var aaRecords = vm.aaModel.aaRecords;
      var ceURL = '';

      AutoAttendantCeMenuModelService.clearCeMenuMap();

      unAssignAssigned().then(function (numbers) {
        if (numbers.length === 0) {
          return;
        }
        _.forEach(aaRecord.assignedResources, function (resource) {
          resource.uuid = _.find(numbers, { number: resource.number }).uuid;
        });

        if (vm.aaModel.aaRecordUUID.length > 0) {
          _.forEach(aaRecords, function (aa) {
            if (AutoAttendantCeInfoModelService.extractUUID(aa.callExperienceURL) === vm.aaModel.aaRecordUUID) {
              ceURL = aa.callExperienceURL;
            }
          });
        }

        return AutoAttendantCeService.updateCe(
          ceURL,
          aaRecord).catch(function (response) {
          AANotificationService.errorResponse(response, 'autoAttendant.errorUpdateCe', {
            name: aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status,
          });
        });
      })
      // unAsignAssigned - calls error notification itself, so no-op here is fine
        .catch(_.noop)
        .finally(function () {
          FeatureToggleService.supports(FeatureToggleService.features.atlasHybridEnable)
            .then(function (results) {
              if (results && $rootScope.isCare === true) {
                $state.go('care.Features');
                $rootScope.isCare = false;
              } else {
                $state.go('huronfeatures');
              }
            })
            .catch(function () {
              $state.go('huronfeatures');
            });
        });
    }

    function populateUiModel() {
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);

      vm.ui.openHours = vm.ui.openHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'openHours');
      vm.ui.closedHours = vm.ui.closedHours || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
      vm.ui.holidays = vm.ui.holidays || AutoAttendantCeMenuModelService.getCombinedMenu(vm.aaModel.aaRecord, 'holidays');
      vm.ui.isOpenHours = true;
      if (_.isUndefined(vm.ui.openHours)) {
        vm.ui.openHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.openHours.setType('MENU_WELCOME');
      }
      if (_.isUndefined(vm.aaModel.aaRecord.scheduleEventTypeMap)) {
        vm.aaModel.aaRecord.scheduleEventTypeMap = {};
      }

      if (!_.isUndefined(vm.aaModel.aaRecord.scheduleEventTypeMap.holiday)) {
        vm.ui.isHolidays = true;
        vm.ui.holidaysValue = vm.aaModel.aaRecord.scheduleEventTypeMap.holiday;
      } else {
        vm.ui.isHolidays = false;
        if (_.isUndefined(vm.ui.holidays)) {
          vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
          vm.ui.holidays.setType('MENU_WELCOME');
        }
      }

      if (!_.isUndefined(vm.aaModel.aaRecord.scheduleEventTypeMap.closed)) {
        vm.ui.isClosedHours = true;
      } else {
        vm.ui.isClosedHours = false;
        if (_.isUndefined(vm.ui.closedHours)) {
          vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
          vm.ui.closedHours.setType('MENU_WELCOME');
        }
      }

      if (vm.aaModel.aaRecord.assignedTimeZone) {
        vm.ui.timeZone = _.find(vm.ui.timeZoneOptions, function (tzOption) {
          return tzOption.id === vm.aaModel.aaRecord.assignedTimeZone;
        });
      } else {
        vm.ui.timeZone = _.find(vm.ui.timeZoneOptions, function (tzOption) {
          return tzOption.id === vm.ui.systemTimeZone.id;
        });
      }
    }

    function saveUiModel() {
      // Reset the UiRestBlocks at the very beginning.
      AARestModelService.setUiRestBlocks({});
      if (!_.isUndefined(vm.ui.ceInfo) && !_.isUndefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        if (!_.isUndefined(vm.ui.builder.ceInfo_name) && (vm.ui.builder.ceInfo_name.length > 0)) {
          vm.ui.ceInfo.setName(_.cloneDeep(vm.ui.builder.ceInfo_name));
        }
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
      if (vm.ui.isOpenHours && !_.isUndefined(vm.ui.openHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'openHours', vm.ui.openHours);
      }
      if (vm.ui.isClosedHours && !_.isUndefined(vm.ui.closedHours)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'closedHours', vm.ui.closedHours);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'closedHours');
        vm.ui.closedHours = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.closedHours.setType('MENU_WELCOME');
      }
      if (vm.ui.isHolidays && !_.isUndefined(vm.ui.holidays)) {
        AutoAttendantCeMenuModelService.updateCombinedMenu(vm.aaModel.aaRecord, 'holidays', vm.ui.holidays, vm.ui.holidaysValue);
      } else {
        AutoAttendantCeMenuModelService.deleteCombinedMenu(vm.aaModel.aaRecord, 'holidays');
        vm.ui.holidays = AutoAttendantCeMenuModelService.newCeMenu();
        vm.ui.holidays.setType('MENU_WELCOME');
      }

      AutoAttendantCeMenuModelService.updateDefaultActionSet(vm.aaModel.aaRecord, vm.ui.hasClosedHours);
      vm.aaModel.aaRecord.assignedTimeZone = vm.ui.timeZone.id;
    }

    // Set the numbers in CMI with error details (involves multiple saves in the AANumberAssignmentService service)
    // Notify the user of any numbers that failed
    function saveAANumberAssignmentWithErrorDetail(resources) {
      return AANumberAssignmentService.formatAAE164ResourcesBasedOnCMI(resources).then(function (fmtResources) {
        AANumberAssignmentService.setAANumberAssignmentWithErrorDetail(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, fmtResources).then(
          function (response) {
            if (_.get(response, 'failedResources.length', false)) {
              AANotificationService.errorResponse(response, 'autoAttendant.errorFailedToAssignNumbers', {
                phoneNumbers: _.map(response.failedResources, 'id'),
              });
            }
            return response;
          }
        );
      });
    }

    function getThirdPartyRestApiDynamicUrl(doRest) {
      var dummyUrlObj = {};
      _.set(dummyUrlObj, 'action.concat.actions[0].dynamic.dynamicOperations', doRest.url);
      return dummyUrlObj;
    }

    function createAuthenticationBlock(action) {
      if (_.isEmpty(action.username)) {
        return undefined;
      }
      var authenticationBlock = {
        type: 'BASIC',
        credentials: {
          username: action.username,
          password: action.password,
          id: action.credentialId,
        },
      };
      return authenticationBlock;
    }

    function makeRestBodyForHttpPostOrPut(action) {
      var doRestBody = {
        url: getThirdPartyRestApiDynamicUrl(action),
        method: action.method,
        responseActions: action.responseActions,
        testResponse: action.testResponse,
        authentication: createAuthenticationBlock(action),
      };
      return doRestBody;
    }

    function doRestPost(action) {
      // Preserve the promise chain and return the promise of createDoRest()
      return DoRestService.createDoRest(makeRestBodyForHttpPostOrPut(action));
    }

    function doRestPut(doRestId, action) {
      // Preserve the promise chain and return the promise of updateDoRest()
      return DoRestService.updateDoRest(doRestId, makeRestBodyForHttpPostOrPut(action));
    }

    function deleteDoRest(doRestList) {
      var promiseList = _.map(doRestList, function (doRest) {
        return DoRestService.deleteDoRest(doRest)
          .then(_.noop)
          .catch(function (response) {
            if (response.status === 404) {
              return response;
            } else {
              return $q.reject(response);
            }
          });
      });
      return $q.all(promiseList);
    }

    function processDeletedRestBlocks(restBlocks, restBlockIds) {
      var deletedRestIds = _.keys(_.pickBy(restBlocks, function (restBlock, key) {
        return (_.isUndefined(restBlockIds[key]));
      }));
      return deleteDoRest(deletedRestIds);
    }

    function updateDoRest(actionSets) {
      var uiRestBlocks = AARestModelService.getUiRestBlocks();
      var restBlocks = AARestModelService.getRestBlocks();

      // Quit processing further in case there is no REST block in either GUI or back-end
      if ((_.size(uiRestBlocks) === 0) && (_.size(restBlocks) === 0)) {
        return $q.resolve();
      }

      var promises = {};
      // POST if id starts with TEMP_, PUT otherwise.
      _.forEach(uiRestBlocks, function (uiRestBlock, restBlockId) {
        if (_.startsWith(restBlockId, AARestModelService.REST_TEMP_ID_PREFIX)) {
          _.set(promises, restBlockId, doRestPost(uiRestBlock));
        } else {
          _.set(promises, restBlockId, doRestPut(restBlockId, uiRestBlock));
        }
      });
      var restBlockIds = {};
      return $q.all(promises).then(function (responses) {
        _.forEach(responses, function (response, key) {
          var doRestId = key;
          var restConfigUrl = _.get(response, 'restConfigUrl');
          if (restConfigUrl) {
            doRestId = _.last(_.split(restConfigUrl, '/'));
          }
          _.set(restBlockIds, key, doRestId);
        });
        _.forEach(actionSets, function (actionSet) {
          var mappedActions = _.get(actionSet, 'actions');
          _.forEach(mappedActions, function (action) {
            if (_.has(action, 'doREST')) {
              action.doREST.id = restBlockIds[action.doREST.id];
            }
          });
        });
        // Make sure to delete the restBlocks if they are marked for Deletion
        return processDeletedRestBlocks(restBlocks, restBlockIds).then(function () {
          var tempRestBlocks = {};
          _.forEach(restBlockIds, function (restBlockId, key) {
            _.set(tempRestBlocks, restBlockId, uiRestBlocks[key]);
          });

          AARestModelService.setUiRestBlocks(tempRestBlocks);
          AARestModelService.setRestBlocks(tempRestBlocks);
        });
      });
    }

    function updateCeDefinition(recNum) {
      var actionSets = _.get(vm, 'aaModel.aaRecord.actionSets', []);
      return updateDoRest(actionSets)
        .then(function () {
          return updateCE(recNum);
        })
        .catch(function (updateRestResponse) {
          AANotificationService.errorResponse(updateRestResponse, 'autoAttendant.errorUpdateCe', {
            name: _.get(vm, 'aaModel.aaRecord.callExperienceName', ''),
            statusText: updateRestResponse.statusText,
            status: updateRestResponse.status,
          });
        })
        .finally(function () {
          _.forEach(actionSets, function (actionSet) {
            if (actionSet.actions) {
              //scheduleName is kept to capture schedule [openHours, closedHours, holidays]
              var scheduleName = actionSet.name;
              var actions = actionSet.actions;
              _.forEach(actions, function (action, index) {
                var doRestId = _.get(action, 'doREST.id', '');
                if (doRestId) {
                  _.set(vm, 'ui.' + scheduleName + '.entries[' + index + '].actions[0].value', doRestId);
                  _.set(vm, 'ui.' + scheduleName + '.entries[' + index + '].actions[0].credentialId', doRestId);
                  _.set(vm, 'ui.' + scheduleName + '.entries[' + index + '].actions[0].password', '');
                }
              });
            }
          });
        });
    }

    function updateCE(recNum) {
      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var updateResponsePromise = AutoAttendantCeService.updateCe(
        aaRecords[recNum].callExperienceURL,
        aaRecord);

      updateResponsePromise.then(
        function () {
          // update successfully
          aaRecords[recNum].callExperienceName = aaRecord.callExperienceName;
          aaRecords[recNum].assignedResources = _.cloneDeep(aaRecord.assignedResources);
          vm.aaModel.ceInfos[recNum] = AutoAttendantCeInfoModelService.getCeInfo(aaRecords[recNum]);

          AACommonService.resetFormStatus();
          vm.canSave = false;

          if (AATrackChangeService.isChanged('AAName', aaRecord.callExperienceName)) {
            var scheduleId = aaRecord.scheduleId;
            var nameChangeEvent = {
              type: 'AANameChange',
              scheduleId: scheduleId,
              newName: aaRecord.callExperienceName,
            };
            AADependencyService.notifyAANameChange(nameChangeEvent);
            AATrackChangeService.track('AAName', aaRecord.callExperienceName);
          }

          AANotificationService.success('autoAttendant.successUpdateCe', {
            name: aaRecord.callExperienceName,
          });

          $rootScope.$broadcast('CE Saved');

          AAMediaUploadService.saveResources();
        },
        function (response) {
          AANotificationService.errorResponse(response, 'autoAttendant.errorUpdateCe', {
            name: aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status,
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
          newAaRecord.assignedResources = _.cloneDeep(aaRecord.assignedResources);
          newAaRecord.callExperienceURL = response.callExperienceURL;
          aaRecords.push(newAaRecord);
          vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(response.callExperienceURL);
          vm.aaModel.ceInfos.push(AutoAttendantCeInfoModelService.getCeInfo(newAaRecord));

          AACommonService.resetFormStatus();
          vm.canSave = false;
          AATrackChangeService.track('AAName', aaRecord.callExperienceName);

          AANotificationService.success('autoAttendant.successCreateCe', {
            name: aaRecord.callExperienceName,
          });
        },
        function (response) {
          AANotificationService.errorResponse(response, 'autoAttendant.errorCreateCe', {
            name: aaRecord.callExperienceName,
            statusText: response.statusText,
            status: response.status,
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
          return !_.isUndefined(entry.actions) &&
            (entry.actions.length === 0 ||
              (entry.actions.length === 1 && entry.actions[0].name.length === 0));
        });
      }
    }

    function saveCE(recNum) {
      if (AACommonService.isRestApiToggle()) {
        return updateCeDefinition(recNum);
      }
      return updateCE(recNum);
    }

    function saveAARecords(validateCES) {
      var deferred = $q.defer();
      var aaRecords = vm.aaModel.aaRecords;
      var aaRecord = vm.aaModel.aaRecord;

      var aaRecordUUID = vm.aaModel.aaRecordUUID;
      vm.ui.builder.ceInfo_name = _.trim(vm.ui.builder.ceInfo_name);
      if (!AAValidationService.isNameValidationSuccess(vm.ui.builder.ceInfo_name, aaRecordUUID)) {
        deferred.reject({
          statusText: '',
          status: 'VALIDATION_FAILURE',
        });
        return deferred.promise;
      }

      if (validateCES && !AAValidationService.isValidCES(vm.ui)) {
        deferred.reject({
          statusText: '',
          status: 'VALIDATION_FAILURE',
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

          return saveAANumberAssignmentWithErrorDetail(currentlyShownResources).then(function () {
            return AANumberAssignmentService.formatAAExtensionResourcesBasedOnCMI(Authinfo.getOrgId(), vm.aaModel.aaRecordUUID, currentlyShownResources).then(function () {
              return saveCE(recNum);
            });
          });
        } else {
          return saveCE(recNum);
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
        tname: vm.templateName,
      });

      if (_.isUndefined(specifiedTemplate) || _.isUndefined(specifiedTemplate.tname) || specifiedTemplate.tname.length === 0) {
        AANotificationService.error('autoAttendant.errorInvalidTemplate', {
          template: vm.templateName,
        });
        return;
      }

      if (_.isUndefined(specifiedTemplate.actions) || specifiedTemplate.actions.length === 0) {
        AANotificationService.error('autoAttendant.errorInvalidTemplateDef', {
          template: vm.templateName,
        });
        return;
      }

      _.forEach(specifiedTemplate.actions, function (action) {
        var uiMenu = vm.ui[action.lane];

        if (action.lane === 'holidays') {
          vm.ui.isHolidays = true;
        }

        if (action.lane === 'closedHours') {
          vm.ui.isClosedHours = true;
        }

        if (_.isUndefined(action.actionset)) {
          AANotificationService.error('autoAttendant.errorInvalidTemplateDef', {
            template: vm.templateName,
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
            keyEntry.type = 'MENU_OPTION';
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

    function readDoRest(actionSets) {
      var promises = {};
      var responseBlockPrefix = '$Response.';
      var restBlocks = {};

      _.forEach(actionSets, function (actionSet) {
        var actions = _.get(actionSet, 'actions');
        _.forEach(actions, function (action) {
          if (action.doREST) {
            _.set(promises, action.doREST.id, DoRestService.readDoRest(action.doREST.id));
          }
        });
      });

      return $q.all(promises).then(function (responses) {
        _.forEach(responses, function (response, key) {
          // clean up prefixes (prune out '$Response.')
          _.forEach(response.responseActions, function (responseAction) {
            responseAction.assignVar.value = responseAction.assignVar.value.slice(responseBlockPrefix.length);
          });

          var overrideProps = {
            url: '',
            method: response.method,
            responseActions: response.responseActions,
            testResponse: response.testResponse,
          };

          // make use of 'response' to get rest of the items to be shown under the REST block
          var restApiUrl = _.get(response, 'url.action.concat.actions[0].dynamic.dynamicOperations');
          if (restApiUrl) {
            _.set(overrideProps, 'url', restApiUrl);
          }

          // Error Notification if credential block is Empty
          if (!_.isUndefined(_.get(response, 'authentication'))) {
            if (_.isEmpty(_.get(response, 'authentication.credentials.username'))) {
              AANotificationService.error('autoAttendant.errorReadDoRestCredential', {
                name: vm.aaModel.aaName,
              });
            }
            var username = _.get(response, 'authentication.credentials.username', '');
            _.set(overrideProps, 'username', username);
          }
          restBlocks[key] = overrideProps;
        });
        AARestModelService.setRestBlocks(restBlocks);
        AARestModelService.setUiRestBlocks(restBlocks);
      });
    }

    function populateBuilder(ceName) {
      vm.populateUiModel();
      vm.isAANameDefined = true;
      AATrackChangeService.track('AAName', ceName);
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (_.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.getNewAARecord();
          vm.aaModel.aaRecordUUID = '';
          vm.isAANameDefined = false;
        } else {
          var aaRecord = _.find(vm.aaModel.aaRecords, {
            callExperienceName: aaName,
          });

          if (!_.isUndefined(aaRecord)) {
            AutoAttendantCeService.readCe(aaRecord.callExperienceURL).then(
              function (data) {
                vm.aaModel.aaRecord = data;

                // make sure assigned numbers are from CMI, CES might be out of date.
                vm.aaModel.aaRecord.assignedResources = _.cloneDeep(aaRecord.assignedResources);

                vm.aaModel.aaRecordUUID = AutoAttendantCeInfoModelService.extractUUID(aaRecord.callExperienceURL);

                if (AACommonService.isRestApiToggle()) {
                  var actionSets = _.get(vm.aaModel.aaRecord, 'actionSets', []);
                  readDoRest(actionSets)
                    .then(_.noop)
                    .catch(function (readRestResponse) {
                      AANotificationService.errorResponse(readRestResponse, 'autoAttendant.errorReadCe', {
                        name: aaName,
                        statusText: readRestResponse.statusText,
                        status: readRestResponse.status,
                      });
                    })
                    .finally(function () {
                      populateBuilder(aaRecord.callExperienceName);
                    });
                } else {
                  populateBuilder(aaRecord.callExperienceName);
                }
              },
              function (response) {
                AANotificationService.errorResponse(response, 'autoAttendant.errorReadCe', {
                  name: aaName,
                  statusText: response.statusText,
                  status: response.status,
                });
              });
            return;
          } else {
            AANotificationService.error('autoAttendant.errorReadCe', {
              name: aaName,
            });
          }
        }
      }
      vm.populateUiModel();
      vm.setupTemplate();
    }

    function getSystemTimeZone() {
      vm.ui.systemTimeZone = DEFAULT_TZ;
      if (AACommonService.isMultiSiteEnabled()) {
        return AutoAttendantLocationService.getDefaultLocation().then(function (locationInfo) {
          return { id: locationInfo.timeZone, label: locationInfo.timeZone };
        });
      }
      // otherwise
      return ServiceSetup.listSites().then(function () {
        if (ServiceSetup.sites.length !== 0) {
          return ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
            if (!site.timeZone) {
              // no time zone. no need to loop
              return undefined;
            }
            return _.find(vm.ui.timeZoneOptions, function (timezone) {
              return timezone.id === site.timeZone;
            });
          });
        }
      });
    }

    function getTimeZoneOptions() {
      return ServiceSetup.getTimeZones().then(function (timezones) {
        var tzOptions = ServiceSetup.getTranslatedTimeZones(timezones);
        vm.ui.timeZoneOptions = _.sortBy(tzOptions, 'label');
      });
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
            status: error.status,
          });
          return $q.reject('SAVE_SCHEDULE_FAILURE');
        }
      );
    }

    function saveCeDefinition() {
      return vm.saveAARecords(false).then(
        function () {
          // Sucessfully created new CE Definition, leave Name-assignment page
          vm.isAANameDefined = true;
        },
        function () {
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
              status: error.status,
            });
          }
        );
      }
    }

    $scope.$on('AANameCreated', function () {
      if (vm.ui.aaTemplate && vm.ui.aaTemplate === 'BusinessHours') {
        vm.save8To5Schedule(vm.ui.ceInfo.name).then(vm.saveCeDefinition).catch(vm.delete8To5Schedule);
      } else {
        // on creation, allow the save even without valid entries in the phone menu
        vm.saveAARecords(false).then(
          function () {
            // Sucessfully created new CE Definition, time to move from Name-assignment page
            // to the overlay panel.
            vm.isAANameDefined = true;
          },
          function () {
            $rootScope.$broadcast('AACreationFailed');
          });
      }
    });

    function setUpFeatureToggles(featureToggleDefault) {
      AACommonService.setMediaUploadToggle(featureToggleDefault);
      AACommonService.setRouteSIPAddressToggle(featureToggleDefault);
      AACommonService.setDynAnnounceToggle(featureToggleDefault);
      AACommonService.setRestApiToggle(featureToggleDefault);
      AACommonService.setRestApiTogglePhase2(featureToggleDefault);
      AACommonService.setReturnedCallerToggle(featureToggleDefault);
      AACommonService.setMultiSiteEnabledToggle(featureToggleDefault);
      AACommonService.setHybridToggle(featureToggleDefault);
      return checkFeatureToggles();
    }

    function checkFeatureToggles() {
      return $q.all({
        hasMediaUpload: FeatureToggleService.supports(FeatureToggleService.features.huronAAMediaUpload),
        hasRouteRoom: FeatureToggleService.supports(FeatureToggleService.features.huronAARouteRoom),
        hasRestApi: FeatureToggleService.supports(FeatureToggleService.features.huronAARestApi),
        hasRestApiPhase2: FeatureToggleService.supports(FeatureToggleService.features.huronAARestApiPhase2),
        hasDynAnnounce: FeatureToggleService.supports(FeatureToggleService.features.huronAADynannounce),
        hasReturnedCaller: FeatureToggleService.supports(FeatureToggleService.features.huronAAReturnCaller),
        hasMultiSites: FeatureToggleService.supports(FeatureToggleService.features.huronMultiSite),
        isHybridOrg: FeatureToggleService.supports(FeatureToggleService.features.atlasHybridEnable),
      });
    }

    function assignFeatureToggles(featureToggles) {
      AACommonService.setMediaUploadToggle(featureToggles.hasMediaUpload);
      AACommonService.setRouteSIPAddressToggle(featureToggles.hasRouteRoom);
      AACommonService.setRestApiToggle(featureToggles.hasRestApi);
      AACommonService.setRestApiTogglePhase2(featureToggles.hasRestApiPhase2);
      AACommonService.setDynAnnounceToggle(featureToggles.hasDynAnnounce);
      AutoAttendantCeMenuModelService.setDynAnnounceToggle(featureToggles.hasDynAnnounce);
      AACommonService.setReturnedCallerToggle(featureToggles.hasReturnedCaller);
      AACommonService.setMultiSiteEnabledToggle(featureToggles.hasMultiSites);
      AACommonService.setHybridToggle(featureToggles.isHybridOrg);
    }

    function populateRoutingLocation() {
      return AutoAttendantLocationService.listLocations()
        .then(function (routingLocations) {
          _.forEach(routingLocations.locations, function (location) {
            if (!_.isEmpty(location.routingPrefix)) {
              vm.ui.routingPrefixOptions.push(location.routingPrefix);
            }
          });
          return $q.resolve();
        })
        .catch(function () {
          AANotificationService.error('autoAttendant.errorReadLocations');
          return $q.reject();
        });
    }

    //load the feature toggle prior to creating the elements
    function activate() {
      setUpFeatureToggles(false).then(assignFeatureToggles).finally(init);
    }

    function init() {
      var aaName = $stateParams.aaName;
      AAUiModelService.initUiModel();
      AACommonService.resetFormStatus();

      vm.ui = AAUiModelService.getUiModel();
      vm.ui.ceInfo = {};
      vm.ui.ceInfo.name = aaName;
      vm.ui.builder = {};
      vm.ui.aaTemplate = $stateParams.aaTemplate;
      vm.ui.routingPrefixOptions = [];

      // Define vm.ui.builder.ceInfo_name for editing purpose.
      vm.ui.builder.ceInfo_name = _.cloneDeep(vm.ui.ceInfo.name);

      getTimeZoneOptions().then(function () {
        return getSystemTimeZone();
      }).then(function (tz) {
        if (tz) {
          vm.ui.systemTimeZone = tz;
        }
      }).finally(function () {
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        vm.aaModel = AAModelService.getAAModel();
        vm.aaModel.aaRecord = undefined;
        vm.selectAA(aaName);
        if (AACommonService.isMultiSiteEnabled()) {
          populateRoutingLocation().then(function () {
            setLoadingDone();
            AccessibilityService.setFocus($element, '.aa-name-edit', 2000);
          });
        } else {
          setLoadingDone();
          AccessibilityService.setFocus($element, '.aa-name-edit', 2000);
        }
      });
      if (AACommonService.isHybridEnabledOnOrg()) {
        AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (result) {
          AutoAttendantHybridCareService.setHybridandEPTConfiguration(result);
        });
      }
    }

    function evalKeyPress($event) {
      switch ($event.keyCode) {
        case KeyCodes.ESCAPE:
          closePanel();
          break;
        default:
          break;
      }
    }

    activate();
  }
})();
