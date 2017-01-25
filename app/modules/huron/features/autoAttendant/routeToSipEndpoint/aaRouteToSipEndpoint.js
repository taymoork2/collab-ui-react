(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToSipEndpointCtrl', AARouteToSipEndpointCtrl);

  /* @ngInject */
  function AARouteToSipEndpointCtrl($scope, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;
    vm.model = {};

    vm.uniqueCtrlIdentifer = '';
    vm.sipInput = '';
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

 // the CE action verb is 'route'
    var routeToSipEndpoint = 'routeToSipEndpoint';

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {
      var entry;
      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'queueSettings.fallback', vm.menuKeyEntry);
      }
      vm.sipInput = entry.actions[0].getValue();
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      var entry;
      var endPoint = vm.sipInput;

      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'queueSettings.fallback', vm.menuKeyEntry);
      }
      entry.actions[0].setValue(endPoint);
    }


    function activate() {

      if ($scope.fromRouteCall) {
        var ui = AAUiModelService.getUiModel();
        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        fromRouteCall = true;

        if (!$scope.fromFallback) {
          // if our route is not there, add if no actions, or initialize
          if (vm.menuEntry.actions.length === 0) {
            action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToSipEndpoint, '');
            vm.menuEntry.addAction(action);
          } else {
            if (!(vm.menuEntry.actions[0].getName() === routeToSipEndpoint)) {
              // make sure action is External Number not AA, HG, User, etc
              vm.menuEntry.actions[0].setName(routeToSipEndpoint);
              vm.menuEntry.actions[0].setValue('');
              vm.menuEntry.actions[0].setDescription('');
              delete vm.menuEntry.actions[0].queueSettings;
            }
          }
        }

      } else {
        var action;
        vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        if ($scope.keyIndex < _.size(_.get(vm.menuEntry, 'entries', []))) {
          var entry = vm.menuEntry.entries[$scope.keyIndex];
          action = _.get(entry, 'actions[0]');
       /*   if (action && _.get(action, 'name') === 'routeToSipEndpoint') {
            vm.menuKeyEntry = action;
          } else {*/
          vm.menuKeyEntry = entry;
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToSipEndpoint, '');
          vm.menuKeyEntry.addAction(action);
        }

        vm.menuKeyEntry.routeToId = $scope.$id;

        // used by aaValidationService to identify this menu

        vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, vm.menuKeyEntry.routeToId);

      }

      if ($scope.fromFallback) {
        if (_.has(vm.menuKeyEntry, 'queueSettings')) {
          entry = vm.menuKeyEntry;
        } else {
          entry = vm.menuEntry.actions[0];
        }

        var fallbackAction = _.get(entry, 'queueSettings.fallback.actions[0]');
        if (fallbackAction && (fallbackAction.getName() !== routeToSipEndpoint)) {
          fallbackAction.setName(routeToSipEndpoint);
          fallbackAction.setValue('');
        }
      }

      populateUiModel();

    }

    activate();

  }
})();
