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

    // when country code options are undefined, the cs-country-select control will populate it with all countries
    // we must explicitly define and set it to undefined or we get exception Expression 'undefined' used with directive 'csCountrySelect' is non-assignable!
    vm.options = undefined;
    vm.countryList = [{
      key: 'phoneNumberInput',
      type: 'countrylist',
      templateOptions: {
        placeholder: $translate.instant('autoAttendant.routeExtNumPlaceHolder')
      }
    }];

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    // the CE action verb is 'route'
    var rtExtNum = 'route';

    /////////////////////

    function populateUiModel() {
      vm.model.phoneNumberInput.phoneNumber = vm.menuKeyEntry.actions[0].getValue();
    }

    function saveUiModel() {
      vm.menuKeyEntry.actions[0].setValue(vm.model.phoneNumberInput.phoneNumber);
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

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      if ($scope.keyIndex < vm.menuEntry.entries.length) {
        vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
      } else {
        vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtExtNum, '');
        vm.menuKeyEntry.addAction(action);
      }

      populateUiModel();

    }

    activate();

  }
})();
