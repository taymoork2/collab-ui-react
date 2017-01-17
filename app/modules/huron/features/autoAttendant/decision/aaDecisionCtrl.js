(function () {
  'use strict';

  angular
  .module('uc.autoattendant')
  .controller('AADecisionCtrl', AADecisionCtrl);

  /* @ngInject */
  function AADecisionCtrl($scope, $translate, QueueHelperService, AACommonService, AAUiModelService, AutoAttendantCeMenuModelService) {

    var vm = this;

    var actionName = 'decision';
    vm.queues = [];

    vm.menuEntry = {};
    vm.actionEntry = {};

    vm.selectConditionPlaceholder = $translate.instant('autoAttendant.selectConditionPlaceholder');
    vm.selectActionPlaceholder = $translate.instant('autoAttendant.selectActionPlaceholder');

    vm.ifOption = {
      label: '',
      value: ''
    };


    vm.ifOptions = [{
      label: $translate.instant('autoAttendant.decisionCallerReturned'),
      value: 'callerReturned',
    }, {
      label: $translate.instant('autoAttendant.decisionNumberDialed'),
      value: 'numberDialed'
    }, {
      label: $translate.instant('autoAttendant.decisionCallerNumber'),
      value: 'callerNumber',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerName'),
      value: 'callerName',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerCountryCode'),
      value: 'countryCode',
    }, {
      label: $translate.instant('autoAttendant.decisionCallerAreaCode'),
      value: 'areaCode'
    }];

    vm.thenOption = {
      label: '',
      value: ''
    };

    vm.thenOptions = [{
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      value: 'routeToHuntGroup'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      value: 'goto'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      value: 'routeToUser'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      value: 'routeToVoiceMail'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      value: 'route'
    }];

    vm.callerReturnedOption = {
      label: $translate.instant('autoAttendant.callerReturnedOneWeek'),
      value: 'One Week'
    };

    vm.callerReturnedOptions = [{
      label: $translate.instant('autoAttendant.callerReturned5Mins'),
      value: '5 mins',
    }, {
      label: $translate.instant('autoAttendant.callerReturnedOneDay'),
      value: 'One Day',
    }, {
      label: $translate.instant('autoAttendant.callerReturnedOneWeek'),
      value: 'One Week',
    }, {
      label: $translate.instant('autoAttendant.callerReturnedTwoWeeks'),
      value: 'Two Week',
    }, {
      label: $translate.instant('autoAttendant.callerReturnedOneMonth'),
      value: 'One Month',
    }, {
      label: 'How about Never?',
      value: 'Never',
    }];

    vm.callerNumber = '';
    vm.numberDialed = '';
    vm.callerName = '';
    vm.countryCode = '';
    vm.areaCode = '';

    vm.setIfDecision = setIfDecision;
    vm.setCallerReturned = setCallerReturned;
    vm.saveNumberDialed = saveNumberDialed;
    vm.saveCallerNumbers = saveCallerNumbers;
    vm.saveCallerName = saveCallerName;
    vm.saveCountryCode = saveCountryCode;
    vm.saveAreaCode = saveAreaCode;

    /////////////////////
    function saveCallerNumbers() {
      vm.actionEntry.if.rightCondition = vm.callerNumber;
    }

    function saveNumberDialed() {
      vm.actionEntry.if.rightCondition = vm.numberDialed;
    }
    function saveCallerName() {
      vm.actionEntry.if.rightCondition = vm.callerName;
    }
    function saveCountryCode() {
      vm.actionEntry.if.rightCondition = vm.countryCode;
    }
    function saveAreaCode() {
      vm.actionEntry.if.rightCondition = vm.areaCode;
    }
    function setCallerReturned() {
      vm.actionEntry.if.rightCondition = vm.callerReturnedOption.value;
    }

    function createDecisionAction() {
      var action = AutoAttendantCeMenuModelService.newCeActionEntry(actionName, '');
      action.if = {};
      action.if.leftCondition = '';
      action.if.rightCondition = '';

      return action;

    }
    function setIfDecision() {
      vm.actionEntry.if.leftCondition = vm.ifOption.value;
      switch (vm.ifOption.value) {
        case 'callerReturned':
          vm.actionEntry.if.rightCondition = vm.callerReturnedOption.value;
          break;
        case 'numberDialed':
          vm.actionEntry.if.rightCondition = vm.numberDialed;
          break;
        case 'callerName':
          vm.actionEntry.if.rightCondition = vm.callerName;
          break;
        case 'countryCode':
          vm.actionEntry.if.rightCondition = vm.countryCode;
          break;
        case 'areaCode':
          vm.actionEntry.if.rightCondition = vm.areaCode;
          break;
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

    function setActionEntry() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      var action = getAction(vm.menuEntry);
      if (!action) {
        action = createDecisionAction();
        vm.menuEntry.addAction(action);
      }

      vm.actionEntry = action;

      return;
    }

    function populateMenu() {
    }
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

    function sortAndSetActionType() {
      vm.thenOptions.sort(AACommonService.sortByProperty('label'));
    }

    function activate() {
      setActionEntry();
      if (AACommonService.isRouteQueueToggle()) {
        getQueues().finally(sortAndSetActionType);
      } else {
        sortAndSetActionType();
      }

      populateMenu();
    }

    activate();

  }

})();
