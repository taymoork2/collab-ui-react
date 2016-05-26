(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToExtNumCtrl', AARouteToExtNumCtrl);

  /* @ngInject */
  function AARouteToExtNumCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;

    vm.model = {};

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

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    /* Using the tag 'RouteCall' to differentiate btw Phone Menu and Route Call, useful in aaValidateSuccess.js */
    vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, $scope.index, ($scope.keyIndex ? $scope.keyIndex : "RouteCall"));

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    // the CE action verb is 'route'
    var rtExtNum = 'route';

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {
      if (fromRouteCall) {
        vm.model.phoneNumberInput.phoneNumber = vm.menuEntry.actions[0].getValue();
      } else {
        vm.model.phoneNumberInput.phoneNumber = vm.menuKeyEntry.actions[0].getValue();
      }
    }

    function saveUiModel() {
      var num = vm.model.phoneNumberInput.phoneNumber;

      if (num) {
        num = num.replace(/[-\s]*/g, '');
      }

      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(num);
      } else {
        vm.menuKeyEntry.actions[0].setValue(num);
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
      function (event) {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      }
    );

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      if ($scope.fromRouteCall) {
        fromRouteCall = true;

        // if our route is not there, add if no actions, or initialize
        if (vm.menuEntry.actions.length === 0) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
          vm.menuEntry.addAction(action);
        } else {

          if (!(vm.menuEntry.actions[0].getName() === rtExtNum)) {
            // make sure action is External Number not AA, HG, User, etc
            vm.menuEntry.actions[0].setName(rtExtNum);
            vm.menuEntry.actions[0].setValue('');
          }

        }

      } else {

        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
          vm.menuKeyEntry.addAction(action);
        }
      }

      populateUiModel();

    }

    activate();

  }
})();
