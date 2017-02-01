(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToSipEndpointCtrl', AARouteToSipEndpointCtrl);

  /* @ngInject */
  function AARouteToSipEndpointCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;
    vm.model = {};
    vm.uniqueCtrlIdentifer = '';

    vm.model.sipInput = '';
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.saveUiModel = saveUiModel;
    vm.isSipValid = isSipValid;
    vm.routeToSipPlaceHolder = $translate.instant('autoAttendant.routeToSipPlaceHolder');

    // the CE action verb is 'routeToSipEndpoint'
    var routeToSipEndpoint = 'routeToSipEndpoint';

    var fromRouteCall = false;
    var sipInitial = "sip:";

    /////////////////////

    function isSipValid() {
      var pattern = new RegExp("^[A-Za-z0-9]@[A-Za-z0-9]");
      var result = pattern.test(vm.model.sipInput);
      return result;
    }

    function populateUiModel() {
      var entry;
      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }
      if (_.isEmpty(entry.actions[0].getValue())) {
        vm.model.sipInput = sipInitial;
      } else {
        vm.model.sipInput = entry.actions[0].getValue();
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      var entry;

      if (isSipValid()) {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      } else {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, false);
      }

      if (fromRouteCall) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }
      entry.actions[0].setValue(vm.model.sipInput);
    }

    $scope.$on(
      "$destroy",
      function () {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      }
    );

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
          vm.menuEntry.routeToId = $scope.$id;
          // used by aaValidationService to identify this menu
          vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, vm.menuEntry.routeToId);
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
        vm.menuKeyEntry.routeToId = $scope.$id;

        // used by aaValidationService to identify this menu

        vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, vm.menuKeyEntry.routeToId);
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
