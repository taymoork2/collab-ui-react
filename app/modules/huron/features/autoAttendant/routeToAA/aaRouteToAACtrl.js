(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToAACtrl', AARouteToAACtrl);

  /* @ngInject */
  function AARouteToAACtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;
    var conditional = 'conditional';

    vm.aaModel = {};
    vm.menuEntry = {};

    // cs-select associated inputs:
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.options = [];
    vm.aaName = '';

    vm.saveUiModel = saveUiModel;

    /////////////////////

    function aaName2CeId(aaName) {
      var ceInfos = vm.aaModel.ceInfos;
      var ceInfo = _.find(ceInfos, _.bind(function (ceInfo) {
        return this === ceInfo.name;
      }, aaName));
      if (!_.isUndefined(ceInfo)) {
        var index = ceInfo.ceUrl.lastIndexOf('/');
        if (index < 0) {
          return '';
        }
        return ceInfo.ceUrl.substr(index + 1);
      }
      return '';
    }

    function ceId2aaName(ceId) {
      var ceInfos = vm.aaModel.ceInfos;
      var ceInfo = _.find(ceInfos, _.bind(function (ceInfo) {
        var index = ceInfo.ceUrl.lastIndexOf('/');
        if (index < 0) {
          return false;
        }
        return this === ceInfo.ceUrl.substr(index + 1);
      }, ceId));
      if (!_.isUndefined(ceInfo)) {
        return ceInfo.name;
      }
      return '';
    }

    function populateUiModel() {
      var entry;
      var action;

      entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      action = _.get(entry, 'actions[0]');

      if (action && _.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }

      vm.aaName = ceId2aaName(action.value);

    }

    function saveUiModel() {
      var action;

      AACommonService.setPhoneMenuStatus(true);

      action = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback.actions[0]', vm.menuEntry.actions[0]);

      if (_.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }
      action.setValue(aaName2CeId(vm.aaName));
    }
    function checkForRouteToAA(action) {

      // make sure action is AA not External Number, HG, User, etc
      if (!(action.getName() === 'goto')) {
        action.setName('goto');
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {
      var action;
      var uiCombinedMenu;

      var uiModel = AAUiModelService.getUiModel();

      if ($scope.fromDecision) {
        var conditionalAction;

        uiCombinedMenu = uiModel[$scope.schedule];
        vm.menuEntry = uiCombinedMenu.entries[$scope.index];
        conditionalAction = _.get(vm.menuEntry, 'actions[0]', '');
        if (!conditionalAction || conditionalAction.getName() !== conditional) {
          conditionalAction = AutoAttendantCeMenuModelService.newCeActionEntry(conditional, '');
          vm.menuEntry.actions[0] = conditionalAction;

        }
        if (!$scope.fromFallback) {
          if (!conditionalAction.then) {
            conditionalAction.then = {};
            conditionalAction.then = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
          } else {
            checkForRouteToAA(conditionalAction.then);
          }
        }
      } else {
        if ($scope.fromRouteCall) {
          uiCombinedMenu = uiModel[$scope.schedule];
          vm.menuEntry = uiCombinedMenu.entries[$scope.index];

          if (!$scope.fromFallback) {
            if (vm.menuEntry.actions.length === 0) {
              action = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
              vm.menuEntry.addAction(action);
            } else {
              checkForRouteToAA(vm.menuEntry.actions[0]);

            }
          }
        } else {
          var uiPhoneMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          // Read an existing routeToAA entry if exist or initialize it if not
          if ($scope.keyIndex < uiPhoneMenu.entries.length) {
            vm.menuEntry = uiPhoneMenu.entries[$scope.keyIndex];
          } else {
            vm.menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            action = AutoAttendantCeMenuModelService.newCeActionEntry('goto', '');
            vm.menuEntry.addAction(action);
          }

        }
      }

      if ($scope.fromFallback) {
        var fb_action = _.get(vm.menuEntry, 'actions[0]');
        if (_.get(fb_action, 'name') === conditional) {
          fb_action = fb_action.then;
        }
        var fallbackAction = _.get(fb_action, 'queueSettings.fallback.actions[0]');
        if (fallbackAction && (fallbackAction.getName() !== 'goto')) {
          fallbackAction.setName('goto');
          fallbackAction.setValue('');
        }
      }

      // Deduce list of Auto Attendants
      vm.aaModel = AAModelService.getAAModel();
      var ceInfos = vm.aaModel.ceInfos;
      var options = _.map(ceInfos, 'name');
      options = _.without(options, uiModel.ceInfo.name);
      options.sort(function (a, b) {
        return a.localeCompare(b);
      });

      vm.options = options;

      populateUiModel();
    }

    activate();

  }
})();
