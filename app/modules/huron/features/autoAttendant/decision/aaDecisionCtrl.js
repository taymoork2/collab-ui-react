(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADecisionCtrl', AADecisionCtrl);

  /* @ngInject */
  function AADecisionCtrl($scope, $translate /*, QueueHelperService*/, AACesOnboardHelperService, AACommonService, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AASessionVariableService) {
    var vm = this;

    var actionName = 'conditional';
    var dependentCeSessionVariablesList = [];

    vm.queues = [];

    vm.ui = {};
    vm.menuEntry = {};
    vm.actionEntry = {};

    vm.selectConditionPlaceholder = $translate.instant('autoAttendant.selectConditionPlaceholder');
    vm.selectActionPlaceholder = $translate.instant('autoAttendant.selectActionPlaceholder');
    vm.selectVariablePlaceholder = $translate.instant('autoAttendant.selectVariablePlaceholder');
    vm.varMissingWarning = $translate.instant('autoAttendant.decisionMissingCustomVariable');

    vm.ifOption = {
      label: '',
      value: '',
    };
    vm.isWarn = false;
    vm.sessionVarOption = '';
    vm.sessionVarOptions = [];

    vm.ifOptions = [{
      label: $translate.instant('autoAttendant.decisionNumberDialed'),
      value: 'Original-Called-Number',
      buffer: '',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerNumber'),
      value: 'Original-Caller-Number',
      buffer: '',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerName'),
      value: 'Original-Remote-Party-ID',
      buffer: '',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerCountryCode'),
      value: 'Original-Caller-Country-Code',
      buffer: '',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerAreaCode'),
      value: 'Original-Caller-Area-Code',
      buffer: '',
    }];

    vm.thenOption = {
      label: '',
      value: '',
    };

    vm.thenOptions = [{
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      value: 'routeToHuntGroup',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      value: 'goto',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      value: 'routeToUser',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      value: 'routeToVoiceMail',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      value: 'route',
    }];

    vm.setIfDecision = setIfDecision;
    vm.update = update;
    vm.refreshIfSelects = refreshIfSelects;
    vm.refreshVarSelects = refreshVarSelects;

    var fromQuery = [];

    ///////////////////////////////////////////////////////
    $scope.$on('CE Updated', function () {
      getSessionVariablesOfDependentCe().finally(function () {
        refreshVars();
      });
    });

    $scope.$on('CIVarNameChanged', function (event, oldCI) {
      getSessionVarsAfterRemovingChangedValue(oldCI);

      if (_.includes(vm.sessionVarOptions, vm.sessionVarOption)) {
        setWarning(false);
      } else {
        setWarning(true);
      }
    });

    function refreshVars() {
      vm.sessionVarOptions = _.concat(dependentCeSessionVariablesList, AACommonService.collectThisCeActionValue(vm.ui, true, false));

      vm.sessionVarOptions = _.uniq(vm.sessionVarOptions).sort();

      // resets possibly warning messages
      setLeft();
    }

    function setWarning(flag) {
      vm.isWarn = flag;
    }

    function getSessionVariablesOfDependentCe() {
      dependentCeSessionVariablesList = [];

      return AASessionVariableService.getSessionVariablesOfDependentCeOnly(_.get(AAModelService.getAAModel(), 'aaRecordUUID')).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          dependentCeSessionVariablesList = data;
        }
      });
    }

    function getSessionVarsAfterRemovingChangedValue(oldCI) {
      vm.sessionVarOptions = fromQuery.filter(function (value) {
        return !_.isEqual(value, oldCI);
      });
      // add in any user entered SessionVars
      // false === don't collect conditionals
      vm.sessionVarOptions = _.concat(vm.sessionVarOptions, AACommonService.collectThisCeActionValue(vm.ui, true, false));
    }

    function addLocalAndQueriedSessionVars() {
      // reset the displayed SessionVars to the original queried items

      vm.sessionVarOptions = fromQuery;

      // add in any user entered SessionVars
      // false === don't collect conditionals
      vm.sessionVarOptions = _.concat(vm.sessionVarOptions, AACommonService.collectThisCeActionValue(vm.ui, true, false));

      vm.sessionVarOptions = _.uniq(vm.sessionVarOptions).sort();
    }
    function refreshIfSelects() {
      // If a caller input var was entered AND the decision screen is already on screen we
      // need to add the (possibly) missing session variable selection to the dropdown

      addLocalAndQueriedSessionVars();

      if (_.find(vm.ifOptions, { value: 'sessionVariable' })) {
        return; // already there nothing to do
      }
      if (vm.sessionVarOptions.length > 0) {
        addSessionObject();
      }
    }

    function refreshVarSelects() {
      // reload the session variables.
      // params true === collect session variables
      addLocalAndQueriedSessionVars();

      // resets possibly warning messages
      setLeft();
    }

    function update(which) {
      AACommonService.setDecisionStatus(true);
      var option = _.find(vm.ifOptions, { value: which });
      if (_.isEqual(option.value, 'callerReturned')) {
        vm.actionEntry.if.rightCondition = option.buffer.value;
      } else {
        vm.actionEntry.if.rightCondition = option.buffer;
      }
    }

    function createDecisionAction() {
      var action = AutoAttendantCeMenuModelService.newCeActionEntry(actionName, '');
      action.if = {};
      action.if.leftCondition = '';
      action.if.rightCondition = '';
      /* the various controller, routeTo's, will create a 'then' action for their type */
      return action;
    }

    function setIfDecision() {
      setLeft();
      setRight();
      AACommonService.setDecisionStatus(true);
    }

    function setLeft() {
      if (vm.ifOption.value == 'sessionVariable') {
        vm.actionEntry.if.leftCondition = vm.sessionVarOption;
        // no warning if blank leftCondition - first time through
        vm.isWarn = vm.actionEntry.if.leftCondition ? !_.includes(vm.sessionVarOptions, vm.actionEntry.if.leftCondition) : false;
      } else {
        vm.isWarn = false;
        vm.actionEntry.if.leftCondition = vm.ifOption.value;
      }
    }

    function setRight() {
      var option = _.find(vm.ifOptions, { value: vm.ifOption.value });
      if (_.isEqual(option.value, 'callerReturned')) {
        vm.actionEntry.if.rightCondition = option.buffer.value;
      } else {
        vm.actionEntry.if.rightCondition = option.buffer;
      }
    }

    function getAction(menuEntry) {
      var action;

      action = _.get(menuEntry, 'actions[0]');

      if (_.get(action, 'name', '') === actionName) {
        return action;
      }

      return undefined;
    }

    function addSessionObject() {
      vm.ifOptions.push({
        label: $translate.instant('autoAttendant.decisionSessionVariable'),
        value: 'sessionVariable',
        buffer: '',
      });
    }
    function setActionEntry() {
      vm.ui = AAUiModelService.getUiModel();
      var uiMenu = vm.ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      var action = getAction(vm.menuEntry);
      if (!action) {
        action = createDecisionAction();
        vm.menuEntry.addAction(action);
      }

      vm.actionEntry = action;
    }

    function populateMenu() {
      if (vm.actionEntry.if.leftCondition) {
        vm.ifOption = _.find(vm.ifOptions, { value: vm.actionEntry.if.leftCondition });
        if (!vm.ifOption) {
          vm.ifOption = _.find(vm.ifOptions, { value: 'sessionVariable' });
          if (!vm.ifOption) {
            addSessionObject();
            vm.ifOption = vm.ifOptions[vm.ifOptions.length - 1];
          }
          vm.isWarn = !_.includes(vm.sessionVarOptions, vm.actionEntry.if.leftCondition);
          vm.sessionVarOption = vm.actionEntry.if.leftCondition;
        }
        if (vm.ifOption.value === 'callerReturned') {
          vm.ifOption.buffer = _.find(vm.callerReturnedOptions, { value: vm.actionEntry.if.rightCondition });
        } else {
          vm.ifOption.buffer = vm.actionEntry.if.rightCondition;
        }
      }
      if (_.has(vm.actionEntry, 'then.name')) {
        vm.thenOption = _.find(vm.thenOptions, { value: vm.actionEntry.then.name });
      }
    }
    /* No support for Queues as of this story US260317
     *

    function getQueues() {
      return QueueHelperService.listQueues().then(function (aaQueueList) {
        if (aaQueueList.length > 0) {
          vm.thenOptions.push({
            "label": $translate.instant('autoAttendant.phoneMenuRouteQueue'),
            "value": 'routeToQueue'
          });
          _.each(aaQueueList, function (aaQueue) {
            var idPos = aaQueue.queueUrl.lastIndexOf("/");
            vm.queues.push({
              description: aaQueue.queueName,
              id: aaQueue.queueUrl.substr(idPos + 1)
            });
          });
        }
      });
    }
    */

    function setReturnedCallerBasedOnToggle() {
      AACesOnboardHelperService.isCesOnBoarded().then(function (result) {
        if (_.isEqual(result.csOnboardingStatus.toLowerCase(), 'success') && AACommonService.isReturnedCallerToggle()) {
          vm.ifOptions.splice(0, 0, {
            label: $translate.instant('autoAttendant.decisionCallerReturned'),
            value: 'callerReturned',
            buffer: {
              label: $translate.instant('autoAttendant.callerReturnedOneWeek'),
              value: 10080 * 60,
            },
          });

          vm.callerReturnedOption = {
            label: $translate.instant('autoAttendant.callerReturnedOneWeek'),
            value: 10080 * 60,
          };

          vm.callerReturnedOptions = [{
            label: $translate.instant('autoAttendant.callerReturned1Min'),
            value: 1 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturned5Mins'),
            value: 5 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturned30Mins'),
            value: 30 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturned1Hour'),
            value: 60 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturnedOneDay'),
            value: 1440 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturnedOneWeek'),
            value: 10080 * 60,
          }, {
            label: $translate.instant('autoAttendant.callerReturnedOneMonth'),
            value: 43200 * 60,
          }];
          vm.returnedCallerToggle = true;
        } else {
          vm.returnedCallerToggle = false;
        }
      }).catch(function () {
        // failure
        vm.returnedCallerToggle = false;
      });
    }


    function sortAndSetActionType() {
      vm.thenOptions.sort(AACommonService.sortByProperty('label'));
      vm.ifOptions.sort(AACommonService.sortByProperty('label'));
    }

    function activate() {
      setReturnedCallerBasedOnToggle();
      setActionEntry();
      sortAndSetActionType();

      addLocalAndQueriedSessionVars();

      // make sure the option is displayed, from either queried or user entered
      if (vm.sessionVarOptions.length > 0) {
        addSessionObject();
      }

      populateMenu();
    }

    function getSessionVariables() {
      fromQuery = [];

      return AASessionVariableService.getSessionVariables(AAModelService.getAAModel().aaRecordUUID).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          fromQuery = data;
        }
      });
    }

    function init() {
      getSessionVariables().finally(function () {
        /* no support for Queues as of this story.
         * if (AACommonService.isRouteQueueToggle()) {
         *
         * getQueues().finally(activate);
         * } else {
         */
        activate();
        /* } */
      });
    }

    init();
  }
})();
