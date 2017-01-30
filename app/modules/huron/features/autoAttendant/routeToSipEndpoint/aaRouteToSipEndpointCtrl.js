(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToSipEndpointCtrl', AARouteToSipEndpointCtrl);

  /* @ngInject */
  function AARouteToSipEndpointCtrl($scope, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;
    vm.model = {};

    vm.model.sipInput = '';
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;
    vm.isSipValid = isSipValid;

    // the CE action verb is 'routeToSipEndpoint'
    var routeToSipEndpoint = 'routeToSipEndpoint';

    var fromRouteCall = false;

    /////////////////////

    function isSipValid() {
      if (vm.model.sipInput == '' || vm.model.sipInput == 'sip:') {
        return false;
      }
      return true;
    }

    function populateUiModel() {
      var entry;
      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }
      if (_.isEmpty(entry.actions[0].getValue())) {
        vm.model.sipInput = 'sip:';
      } else {
        vm.model.sipInput = entry.actions[0].getValue();
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      AACommonService.setSipStatus(isSipValid());
      var entry;
      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }
      entry.actions[0].setValue(vm.model.sipInput);
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
              vm.menuEntry.actions[0].setName(routeToSipEndpoint);
              vm.menuEntry.actions[0].setValue('');
              vm.menuEntry.actions[0].setDescription('');
              delete vm.menuEntry.actions[0].queueSettings;
            }
          }
        }

      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToSipEndpoint, '');
          vm.menuKeyEntry.addAction(action);
        }

      }

      if ($scope.fromFallback) {
        var entry;
        if (_.has(vm.menuKeyEntry, 'actions[0]')) {
          entry = vm.menuKeyEntry;
        } else {
          entry = vm.menuEntry;
        }

        var fallbackAction = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]');
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
