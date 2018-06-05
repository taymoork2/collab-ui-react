(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToHGCtrl', AARouteToHGCtrl);

  /* @ngInject */
  function AARouteToHGCtrl($scope, $translate, HuntGroupService, AANotificationService, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {
    var vm = this;
    var conditional = 'conditional';
    var schedule;

    vm.hgSelected = {
      description: '',
      id: '',
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.huntGroups = [];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: [],
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    var rtHG = 'routeToHuntGroup';

    var fromRouteCall = false;
    var fromDecision = false;

    /////////////////////

    function populateUiModel() {
      var entry;
      var action;

      if (fromRouteCall || fromDecision) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }

      action = _.get(entry, 'actions[0]');
      if (action && _.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }

      vm.hgSelected.id = action.getValue();

      vm.hgSelected.description = _.result(_.find(vm.huntGroups, {
        id: vm.hgSelected.id,
      }), 'description', '');
      if (vm.hgSelected.description == '') {
        AANotificationService.error('autoAttendant.userNotExist', {
          schedule: schedule,
          route: rtHG,
        });
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      var entry, action;

      if (fromRouteCall || fromDecision) {
        entry = vm.menuEntry;
      } else {
        entry = vm.menuKeyEntry;
      }

      action = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]', entry.actions[0]);

      if (_.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }
      action.setValue(vm.hgSelected.id);
    }

    function getHuntGroups() {
      return HuntGroupService.getHuntGroupList().then(function (hgPool) {
        _.each(hgPool, function (aHuntGroup) {
          vm.huntGroups.push({
            description: aHuntGroup.name.concat(' (').concat(_.head(_.map(aHuntGroup.numbers, 'number'))).concat(')'),
            id: aHuntGroup.uuid,
          });
        });
      });
    }

    function checkForRouteToHG(action) {
      // make sure action is HG not External Number, User, etc
      if (!(action.getName() === rtHG)) {
        action.setName(rtHG);
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      schedule = $scope.schedule;

      if ($scope.fromDecision) {
        var conditionalAction;
        fromDecision = true;

        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        conditionalAction = _.get(vm.menuEntry, 'actions[0]', '');
        if (!conditionalAction || conditionalAction.getName() !== conditional) {
          conditionalAction = AutoAttendantCeMenuModelService.newCeActionEntry(conditional, '');
          vm.menuEntry.actions[0] = conditionalAction;
        }
        if (!$scope.fromFallback) {
          if (!conditionalAction.then) {
            conditionalAction.then = {};
            conditionalAction.then = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
          } else {
            checkForRouteToHG(conditionalAction.then);
          }
        }
      } else {
        if ($scope.fromRouteCall) {
          vm.uiMenu = ui[$scope.schedule];
          vm.menuEntry = vm.uiMenu.entries[$scope.index];
          fromRouteCall = true;

          if (!$scope.fromFallback) {
            if (vm.menuEntry.actions.length === 0) {
              action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
              vm.menuEntry.addAction(action);
            } else {
              checkForRouteToHG(vm.menuEntry.actions[0]);
            }
          }
        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          if ($scope.keyIndex < vm.menuEntry.entries.length) {
            vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
          } else {
            vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
            vm.menuKeyEntry.addAction(action);
          }
        }
      }

      if ($scope.fromFallback) {
        var entry;
        if (_.has(vm.menuKeyEntry, 'actions[0]')) {
          entry = vm.menuKeyEntry.actions[0];
        } else {
          entry = vm.menuEntry.actions[0];
        }
        if (_.get(entry, 'name') === conditional) {
          entry = entry.then;
        }
        var fallbackAction = _.get(entry, 'queueSettings.fallback.actions[0]');
        if (fallbackAction && (fallbackAction.getName() !== rtHG)) {
          fallbackAction.setName(rtHG);
          fallbackAction.setValue('');
        }
      }

      getHuntGroups().then(function () {
        vm.huntGroups.sort(AACommonService.sortByProperty('description'));
        populateUiModel();
      });
    }

    activate();
  }
})();
