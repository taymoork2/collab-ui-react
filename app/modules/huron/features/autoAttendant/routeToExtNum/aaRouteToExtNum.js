(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToExtNumCtrl', AARouteToExtNumCtrl);

  /* @ngInject */
  function AARouteToExtNumCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

    var vm = this;

    vm.model = {};

    vm.uniqueCtrlIdentifer = '';

    vm.model.phoneNumberInput = {
      phoneNumber: ''
    };

    vm.countryList = [{
      key: 'phoneNumberInput',
      type: 'countrylist',
      templateOptions: {
        placeholder: $translate.instant('autoAttendant.routeExtNumPlaceHolder'),
        required: true
      }
    }];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    // the CE action verb is 'route'
    var rtExtNum = 'route';

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {
      var queueSettings;
      if (fromRouteCall) { //from route call
        queueSettings = vm.menuEntry.actions[0].queueSettings;
        if (queueSettings) {
          if (_.has(queueSettings, 'fallback.actions[0]')) {
            vm.model.phoneNumberInput.phoneNumber = queueSettings.fallback.actions[0].getValue();
          }
        } else {
          vm.model.phoneNumberInput.phoneNumber = vm.menuEntry.actions[0].getValue();
        }
      } else { //from phone menu
        queueSettings = vm.menuKeyEntry.queueSettings;
        if (queueSettings) { //from queueSettings modal
          if (_.has(queueSettings, 'fallback.actions[0]')) {
            vm.model.phoneNumberInput.phoneNumber = queueSettings.fallback.actions[0].getValue();
          }
        } else {
          vm.model.phoneNumberInput.phoneNumber = vm.menuKeyEntry.actions[0].getValue();
        }
      }
    }

    function saveUiModel() {
      var action;
      var num = vm.model.phoneNumberInput.phoneNumber;

      if (num) {
        num = _.replace(num, /[-\s]*/g, '');
      }

      var entry;

      if (fromRouteCall) {
        entry = vm.menuEntry;
        action = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]', entry.actions[0]);
      } else {
        entry = vm.menuKeyEntry;
        action = _.get(entry, 'queueSettings.fallback.actions[0]', entry.queueSettings);
      }
//      var action = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]', entry.actions[0]);
      if (action) {
        action.setValue(num);
      } else {
        entry.actions[0].setValue(num);
      }

      AACommonService.setPhoneMenuStatus(true);

    }

    // when the phone number is changed in the UI, save to model
    // the country select control doesn't offer a change element
    // we tried ng-change and it errored and didn't work
    $scope.$watch(
      "aaRouteToExtNum.model.phoneNumberInput.phoneNumber",
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
            action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
            vm.menuEntry.addAction(action);
          } else {
            if (!(vm.menuEntry.actions[0].getName() === rtExtNum)) {
              // make sure action is External Number not AA, HG, User, etc
              vm.menuEntry.actions[0].setName(rtExtNum);
              vm.menuEntry.actions[0].setValue('');
              delete vm.menuEntry.actions[0].queueSettings;
            }
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
      populateUiModel();

    }

    activate();

  }
})();
