(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToExtNumCtrl', AARouteToExtNumCtrl);

  /* @ngInject */
  function AARouteToExtNumCtrl($scope, $translate, AAUiModelService, AACommonService, AutoAttendantCeMenuModelService, AutoAttendantHybridCareService) {
    var vm = this;
    var conditional = 'conditional';

    vm.model = {};

    vm.uniqueCtrlIdentifer = '';

    vm.model.phoneNumberInput = {
      phoneNumber: '',
      extension: '',
    };

    vm.countryList = [{
      key: 'phoneNumberInput',
      type: 'countrylist',
      templateOptions: {
        placeholder: $translate.instant('autoAttendant.routeExtNumPlaceHolder'),
        required: true,
      },
    }];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: [],
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    // the CE action verb is 'route'
    var rtExtNum = 'route';

    var fromRouteCall = false;
    var fromDecision = false;
    vm.routeToExtOptions = ['Telephone Number', 'Extension'];
    vm.getPhoneNumber = getPhoneNumber;
    vm.selectRoutingPrefix = $translate.instant('autoAttendant.selectRoutingPrefix');
    vm.extensionMinLength = 3;
    vm.extensionMaxLength = 10;
    vm.orgHasHybridEnabled = false;
    vm.validationMessages = {
      required: 'Extension field cannot be empty',
      minlength: 'Extension length is too short',
      pattern: 'Only numbers are allowed',
    };


    /////////////////////

    function getPhoneNumber() {
      vm.model.phoneNumberInput.extension = '';
      return vm.model.phoneNumberInput.phoneNumber;
    }

    function populateUiModel() {
      var entry, action;

      if (fromRouteCall || fromDecision) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'queueSettings.fallback', vm.menuKeyEntry);
      }
      action = _.get(entry, 'actions[0]');
      if (action && _.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }
      vm.orgHasHybridEnabled = AutoAttendantHybridCareService.getHybridandEPTConfiguration();

      // value will hold either phone number or extension
      var value = action.getValue();
      if (!vm.orgHasHybridEnabled) {
        if (!_.isEmpty(value)) {
          if (AutoAttendantCeMenuModelService.checkIfEnteredValueIsPhoneNumber(value)) {
            vm.typeOfPhoneNumberSelected = vm.routeToExtOptions[0];
            vm.model.phoneNumberInput.phoneNumber = value;
          } else {
            // case when user has saved extension
            vm.typeOfPhoneNumberSelected = vm.routeToExtOptions[1];
            vm.model.phoneNumberInput.extension = value;
          }
        }
      } else {
        vm.model.phoneNumberInput.phoneNumber = value;
      }
    }

    function saveUiModel(data) {
      var entry, action;
      var num = data;

      if (num) {
        num = _.replace(num, /[-\s]*/g, '');
      }

      if (fromRouteCall || fromDecision) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'queueSettings.fallback', vm.menuKeyEntry);
      }

      action = _.get(entry, 'actions[0]');

      if (_.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }
      action.setValue(num);

      AACommonService.setPhoneMenuStatus(true);
    }

    // when the phone number is changed in the UI, save to model
    // the country select control doesn't offer a change element
    // we tried ng-change and it errored and didn't work
    $scope.$watch(
      'aaRouteToExtNum.model.phoneNumberInput.phoneNumber',
      function handlePhoneNumberChange(newValue, oldValue) {
        if (newValue != oldValue) {
          saveUiModel();
        }
      }
    );

    $scope.$watch('countrySelectForm.$invalid', function (invalid) {
      AACommonService.setIsValid(vm.uniqueCtrlIdentifer, !invalid);
    });

    $scope.$on(
      '$destroy',
      function () {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      }
    );

    function checkForRouteToExt(action) {
      // make sure action is ExtNum not HG, User, etc
      if (!(action.getName() === rtExtNum)) {
        action.setName(rtExtNum);
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();

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
            conditionalAction.then = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
          } else {
            checkForRouteToExt(conditionalAction.then);
          }
        }
      } else {
        if ($scope.fromRouteCall) {
          vm.uiMenu = ui[$scope.schedule];
          vm.menuEntry = vm.uiMenu.entries[$scope.index];
          fromRouteCall = true;

          if (!$scope.fromFallback) {
            // if our route is not there, add if no actions, or initialize
            if (vm.menuEntry.actions.length === 0) {
              action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
              vm.menuEntry.addAction(action);
            } else {
              checkForRouteToExt(vm.menuEntry.actions[0]);
            }
            vm.menuEntry.routeToId = $scope.$id;
            // used by aaValidationService to identify this menu
            vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, vm.menuEntry.routeToId);
          }
        } else {
          var action;
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          if ($scope.keyIndex < _.size(_.get(vm.menuEntry, 'entries', []))) {
            var entry = vm.menuEntry.entries[$scope.keyIndex];
            action = _.get(entry, 'actions[0]');
            if (action && _.get(action, 'name') === 'routeToQueue') {
              vm.menuKeyEntry = action;
            } else {
              vm.menuKeyEntry = entry;
            }
          } else {
            vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
            vm.menuKeyEntry.addAction(action);
          }

          vm.menuKeyEntry.routeToId = $scope.$id;

          // used by aaValidationService to identify this menu

          vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, vm.menuKeyEntry.routeToId);
        }
      }

      if ($scope.fromFallback) {
        if (_.has(vm.menuKeyEntry, 'queueSettings')) {
          entry = vm.menuKeyEntry;
        } else {
          entry = vm.menuEntry.actions[0];
        }
        if (_.get(entry, 'name') === conditional) {
          entry = entry.then;
        }

        var fallbackAction = _.get(entry, 'queueSettings.fallback.actions[0]');
        if (fallbackAction && (fallbackAction.getName() !== rtExtNum)) {
          fallbackAction.setName(rtExtNum);
          fallbackAction.setValue('');
        }
      }

      populateUiModel();
    }

    activate();
  }
})();
