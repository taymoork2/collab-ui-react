(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);


  /* @ngInject */
  function AARouteToQueueCtrl($rootScope, $scope, $translate, $modal, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AANotificationService, AALanguageService, AASessionVariableService, AAModelService) {
    var vm = this;
    var conditional = 'conditional';

    var dependentCeSessionVariablesList = [];
    var dynamicVariablesList = [];
    var dynamicVariableListBeforeCancelClick = [];

    vm.togglefullWarningMsg = togglefullWarningMsg;
    vm.closeFullWarningMsg = closeFullWarningMsg;
    vm.getWarning = getWarning;
    vm.fullWarningMsgValue = false;
    vm.deletedSessionVariablesListAlongWithWarning = '';
    vm.ui = {};
    vm.availableSessionVariablesList = [];
    vm.deletedSessionVariablesList = [];
    vm.varMissingWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariable');

    vm.hideQueues = true;
    vm.queueSelected = {
      description: '',
      id: '',
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.queues = [];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: [],
    };
    vm.menuKeyEntry = {};


    vm.openQueueTreatmentModal = openQueueTreatmentModal;


    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;


    var rtQueue = 'routeToQueue';
    var fromRouteCall = false;
    var fromDecision = false;


    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var periodicTime = '45';

    var maxWaitTime = {
      index: '14',
      label: '15',
    };

    /////////////////////

    $scope.$on('CE Updated', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    $scope.$on('CIVarNameChanged', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    $scope.$on('AACancelQueueSettings', function () {
      addLocalAndQueriedSessionVars();
      getDeletedSessionVariablesList();
    });

    $scope.$on('AASaveQueueSettings', function () {
      dynamicVariableListBeforeCancelClick = [];
      getDynamicVariables();
      refreshVarSelects();
    });

    function togglefullWarningMsg() {
      vm.fullWarningMsgValue = !vm.fullWarningMsgValue;
    }

    function closeFullWarningMsg() {
      vm.fullWarningMsgValue = false;
    }

    function getWarning() {
      if (_.isEmpty(vm.deletedSessionVariablesList)) {
        return false;
      }
      if (vm.deletedSessionVariablesList.length > 1) {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariables', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      } else {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariable', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      }
      return true;
    }

    function addLocalAndQueriedSessionVars() {
      // reset the displayed SessionVars to the original queried items
      vm.availableSessionVariablesList = dependentCeSessionVariablesList;
      vm.availableSessionVariablesList = _.concat(vm.availableSessionVariablesList, AACommonService.collectThisCeActionValue(vm.ui, true, false));
      vm.availableSessionVariablesList = _.uniq(vm.availableSessionVariablesList).sort();
    }

    function refreshVarSelects() {
      // reload the session variables.
      addLocalAndQueriedSessionVars();
      // resets possibly warning messages
      updateIsWarnFlag();
    }

    function getDeletedSessionVariablesList() {
      vm.deletedSessionVariablesList = [];
      _.forEach(dynamicVariableListBeforeCancelClick, function (variable) {
        if (!_.includes(vm.availableSessionVariablesList, variable)) {
          vm.deletedSessionVariablesList.push(JSON.stringify(variable));
        }
      });
      vm.deletedSessionVariablesList = _.sortBy(_.uniq(vm.deletedSessionVariablesList));
    }

    function updateIsWarnFlag() {
      vm.deletedSessionVariablesList = [];
      if (_.isEmpty(dynamicVariablesList)) {
        return;
      }
      _.forEach(dynamicVariablesList, function (variable) {
        if (!_.includes(vm.availableSessionVariablesList, variable)) {
          vm.deletedSessionVariablesList.push(JSON.stringify(variable));
        }
      });
      vm.deletedSessionVariablesList = _.uniq(vm.deletedSessionVariablesList).sort();
    }

    function getSessionVariablesOfDependentCe() {
      dependentCeSessionVariablesList = [];

      return AASessionVariableService.getSessionVariablesOfDependentCeOnly(AAModelService.getAAModel().aaRecordUUID).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          dependentCeSessionVariablesList = data;
        }
      });
    }

    function getDynamicVariables() {
      dynamicVariablesList = [];
      if (fromRouteCall || fromDecision) {
        var initialDynamVarList = _.get(vm.menuEntry, 'actions[0].queueSettings.initialAnnouncement.actions[0].dynamicList');
        var preodicDynamVarList = _.get(vm.menuEntry, 'actions[0].queueSettings.periodicAnnouncement.actions[0].dynamicList');
      } else {
        initialDynamVarList = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.initialAnnouncement.actions[0].dynamicList');
        preodicDynamVarList = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.periodicAnnouncement.actions[0].dynamicList');
      }
      if (!_.isUndefined(initialDynamVarList)) {
        _.forEach(initialDynamVarList, function (entry) {
          if (entry.isDynamic) {
            if (!_.includes(AACommonService.getprePopulatedSessionVariablesList(), entry.say.value)) {
              dynamicVariablesList.push(entry.say.value);
            }
          }
        });
      }
      if (!_.isUndefined(preodicDynamVarList)) {
        _.forEach(preodicDynamVarList, function (entry) {
          if (entry.isDynamic) {
            if (!_.includes(AACommonService.getprePopulatedSessionVariablesList(), entry.say.value)) {
              dynamicVariablesList.push(entry.say.value);
            }
          }
        });
      }
      if (!_.isEmpty(dynamicVariablesList) && _.isEmpty(dynamicVariableListBeforeCancelClick)) {
        dynamicVariableListBeforeCancelClick = dynamicVariablesList;
      }
    }

    function openQueueTreatmentModal() {
      // deep copy used to roll back from the modal changes
      var master = _.cloneDeep(fromRouteCall || fromDecision ? vm.menuEntry.actions[0] : vm.menuKeyEntry.actions[0]);
      var action;

      openQueueSettings().result.then(function () {
        // keep changes as modal was resolved with close
        if (fromRouteCall || fromDecision) {
          action = vm.menuEntry.actions[0];

          if (_.get(action, 'name') === conditional) {
            action = action.then;
          }

          action.description = {
            musicOnHoldDescription: action.queueSettings.musicOnHold.actions[0].description,
            periodicAnnouncementType: action.queueSettings.periodicAnnouncement.actions[0].name,
            periodicAnnouncementDescription: action.queueSettings.periodicAnnouncement.actions[0].description,
            initialAnnouncementType: action.queueSettings.initialAnnouncement.actions[0].name,
            initialAnnouncementDescription: action.queueSettings.initialAnnouncement.actions[0].description,
          };
        } else {
          vm.menuKeyEntry.actions[0].description = {
            musicOnHoldDescription: vm.menuKeyEntry.actions[0].queueSettings.musicOnHold.actions[0].description,
            periodicAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].name,
            periodicAnnouncementDescription: vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].description,
            initialAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.actions[0].name,
            initialAnnouncementDescription: vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.actions[0].description,
          };
        }
      }, function () {
        // discard changes as modal was dismissed
        $rootScope.$broadcast('Queue_Cancelled');

        if (fromRouteCall || fromDecision) {
          vm.menuEntry.actions[0] = master;
        } else {
          vm.menuKeyEntry.actions[0] = master;
        }
      });
      getDynamicVariables();
    }

    function openQueueSettings() {
      return $modal.open({
        template: require('modules/huron/features/autoAttendant/routeToQueue/aaNewTreatmentModal.tpl.html'),
        controller: 'AANewTreatmentModalCtrl',
        controllerAs: 'aaNewTreatmentModalCtrl',
        type: 'full',
        resolve: {
          aa_schedule: function () {
            return $scope.schedule;
          },
          aa_menu_id: function () {
            return $scope.menuId;
          },
          aa_index: function () {
            return $scope.index;
          },
          aa_key_index: function () {
            return $scope.keyIndex;
          },
          aa_from_route_call: function () {
            return $scope.fromRouteCall;
          },
          aa_from_decision: function () {
            return $scope.fromDecision;
          },
        },
        modalClass: 'aa-queue-settings-modal',
      });
    }

    function populateUiModel() {
      var action;

      if (fromRouteCall || fromDecision) {
        action = vm.menuEntry.actions[0];
      } else {
        action = vm.menuKeyEntry.actions[0];
      }

      if (_.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }

      vm.queueSelected.id = action.getValue();

      try {
        vm.queues = JSON.parse($scope.queues);
        if (vm.queueSelected.id == '' && vm.hideQueues && vm.queues.length > 0) {
          vm.queueSelected = vm.queues[0];
          saveUiModel();
        }
        vm.queueSelected.description = _.result(_.find(vm.queues, {
          id: vm.queueSelected.id,
        }), 'description', '');
      } catch (e) {
        AANotificationService.error('No valid queue configured to display Call Queue option.');
      }
    }

    function saveUiModel() {
      var action;
      if (fromRouteCall || fromDecision) {
        action = vm.menuEntry.actions[0];
        if (_.get(action, 'name') === conditional) {
          action.then.setValue(vm.queueSelected.id);
        } else {
          action.setValue(vm.queueSelected.id);
        }
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.queueSelected.id);
        if (!_.isEmpty(vm.menuEntry.headers[0].voice)) {
          var queueSettings = _.get(vm.menuKeyEntry, 'actions[0].queueSettings');
          queueSettings.language = vm.menuEntry.headers[0].language;
          queueSettings.voice = vm.menuEntry.headers[0].voice;
        }
      }
      AACommonService.setPhoneMenuStatus(true);
    }

    // This function is called from activateQueueSettings.
    // It adds the appropriate action (i.e. say or play) to the queueSettings.
    function createAction(settings, type, sayOrPlayOrDisconnect) {
      var action;
      settings[type] = AutoAttendantCeMenuModelService.newCeMenuEntry();
      action = AutoAttendantCeMenuModelService.newCeActionEntry(sayOrPlayOrDisconnect, '');
      settings[type].addAction(action);
    }

    // This function is called from activate.
    // It is checking and creating queueSettings (i.e. MoH, IA, PA, FB).
    function activateQueueSettings(menuEntryParam) {
      var action = _.get(menuEntryParam, 'actions[0]');

      if (_.get(action, 'name') === conditional) {
        action = action.then;
      }

      var queueSettings = _.get(action, 'queueSettings');

      if (!_.has(queueSettings, 'musicOnHold')) {
        createAction(queueSettings, 'musicOnHold', 'play');
        var musicOnHold = _.get(queueSettings, 'musicOnHold.actions[0]');
        musicOnHold.setValue(CISCO_STD_MOH_URL);
      }
      if (!_.has(queueSettings, 'initialAnnouncement')) {
        createAction(queueSettings, 'initialAnnouncement', 'play');
      }
      if (!_.has(queueSettings, 'periodicAnnouncement')) {
        createAction(queueSettings, 'periodicAnnouncement', 'play');
        var periodicAnnouncement = _.get(queueSettings, 'periodicAnnouncement.actions[0]');
        periodicAnnouncement.setDescription('');
        periodicAnnouncement.interval = periodicTime;
      }
      if (!_.has(queueSettings, 'fallback')) {
        createAction(queueSettings, 'fallback', 'disconnect');
      }
      if (!_.has(queueSettings, 'maxWaitTime')) {
        queueSettings.maxWaitTime = maxWaitTime; //default, 15 mins.
      }
      if (!_.has(queueSettings, 'language')) {
        var languageOption = AALanguageService.getLanguageOption();
        queueSettings.language = languageOption.value;//default English(US).
      }
      if (!_.has(queueSettings, 'voice')) {
        var voiceOption = AALanguageService.getVoiceOption();
        queueSettings.voice = voiceOption.value; //default Vanessa.
      }
    }

    function checkForRouteToQueue(action) {
      // make sure action is route To Q not External Number, User, etc
      if (!(action.getName() === rtQueue)) {
        action.setName(rtQueue);
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {
      vm.ui = AAUiModelService.getUiModel();

      if ($scope.fromDecision) {
        var conditionalAction;
        fromDecision = true;

        vm.uiMenu = vm.ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        conditionalAction = _.get(vm.menuEntry, 'actions[0]', '');
        if (!conditionalAction || conditionalAction.getName() !== conditional) {
          conditionalAction = AutoAttendantCeMenuModelService.newCeActionEntry(conditional, '');
          vm.menuEntry.actions[0] = conditionalAction;
        }

        if (!conditionalAction.then) {
          conditionalAction.then = {};
          conditionalAction.then = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
        } else {
          checkForRouteToQueue(conditionalAction.then);
        }

        if (!_.has(conditionalAction.then, 'queueSettings')) {
          conditionalAction.then.queueSettings = {};
        }

        activateQueueSettings(vm.menuEntry);
      } else {
        if ($scope.fromRouteCall) {
          vm.uiMenu = vm.ui[$scope.schedule];
          vm.menuEntry = vm.uiMenu.entries[$scope.index];
          fromRouteCall = true;

          if (vm.menuEntry.actions.length === 0) {
            action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
            vm.menuEntry.addAction(action);
          } else {
            checkForRouteToQueue(vm.menuEntry.actions[0]);
          }
          if (!_.has(_.get(vm.menuEntry, 'actions[0]'), 'queueSettings')) {
            vm.menuEntry.actions[0].queueSettings = {};
          }

          activateQueueSettings(vm.menuEntry);
        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          if ($scope.keyIndex < vm.menuEntry.entries.length) {
            vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
          } else {
            vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
            vm.menuKeyEntry.addAction(action);
          }
          if (!_.has(_.get(vm.menuKeyEntry, 'actions[0]'), 'queueSettings')) {
            vm.menuKeyEntry.actions[0].queueSettings = {};
          }
          activateQueueSettings(vm.menuKeyEntry);
        }
      }

      populateUiModel();
      getSessionVariablesOfDependentCe().finally(function () {
        getDynamicVariables();
        refreshVarSelects();
      });
    }
    activate();
  }
})();
