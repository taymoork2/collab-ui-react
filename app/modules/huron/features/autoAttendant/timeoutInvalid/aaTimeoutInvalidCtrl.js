(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AATimeoutInvalidCtrl', AATimeoutInvalidCtrl);

  /* @ngInject */
  function AATimeoutInvalidCtrl($scope, $translate, $filter, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService, Config) {

    var vm = this;

    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');

    vm.selectedActions = [];
    vm.selectedTimeout = {
      name: '',
      value: ''
    };
    vm.menuEntry = {};
    vm.repeatOptions = [{
      label: $translate.instant('autoAttendant.phoneMenuRepeatOnce'),
      name: 'phoneMenuRepeatOnce',
      value: 2
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatTwice'),
      name: 'phoneMenuRepeatTwice',
      value: 3
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatThree'),
      name: 'phoneMenuRepeatThree',
      value: 4
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFour'),
      name: 'phoneMenuRepeatFour',
      value: 5
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFive'),
      name: 'phoneMenuRepeatFive',
      value: 6
    }];

    vm.timeoutInvalidChanged = timeoutInvalidChanged;
    vm.populateOptionMenu = populateOptionMenu;
    vm.createOptionMenu = createOptionMenu;

    vm.timeoutActions = [{
      label: $translate.instant('autoAttendant.phoneMenuContinue'),
      name: 'phoneMenuContinue',
      action: 'repeatActionsOnInput',
      value: 1
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      name: 'repeatMenu',
      action: 'repeatActionsOnInput',
      value: 2,
      childOptions: vm.repeatOptions
    }];

    var runActionsOnInput = 'runActionsOnInput';

    /////////////////////////

    function timeoutInvalidChanged() {
      var entry = vm.menuEntry;
      setPhonemenuFormDirty();
      // this is number of times to repeat the timeout/invalid menu
      if (vm.selectedTimeout.value === 1) {
        entry.attempts = vm.selectedTimeout.value;
      } else if (vm.selectedTimeout.value === 2) {
        if (angular.isDefined(vm.selectedTimeout.selectedChild)) {
          entry.attempts = vm.selectedTimeout.selectedChild.value;
        }
      }
    }

    function setDefaultTimeoutOption() {
      // default option is repeat menu 3x
      vm.selectedTimeout = vm.timeoutActions[1];
      vm.selectedTimeout.childOptions = vm.repeatOptions;
      vm.selectedTimeout.selectedChild = vm.repeatOptions[2];
    }

    function populateOptionMenu() {
      // populate with data from an existing AA
      var entry = vm.menuEntry;

      if (angular.isDefined(entry.attempts)) {
        // both timeout options have the same action name so
        // we distinguish by the number of attempts allowed
        if (entry.attempts === 1) {
          vm.selectedTimeout = angular.copy(vm.timeoutActions[0]);
        } else {
          vm.selectedTimeout = angular.copy(vm.timeoutActions[1]);
          vm.selectedTimeout.childOptions = angular.copy(vm.repeatOptions);
          if (entry.attempts >= 2 && entry.attempts <= 6) {
            vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[entry.attempts - 2]);

          } else {
            // this case should never happens.
            vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[0]);
          }
        }
      } else {
        // if attempts is not specified, menu defaults to first timeout
        setDefaultTimeoutOption();

        // which is 3, aka 4
        vm.menuEntry.attempts = 4;

      }

    }

    function createOptionMenu() {
      vm.selectedTimeout = angular.copy(vm.timeoutActions[0]);
      vm.selectedTimeout.childOptions = angular.copy(vm.repeatOptions);
      vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[2]);
    }

    function setPhonemenuFormDirty() {
      AACommonService.setPhoneMenuStatus(true);
    }

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[vm.schedule];
      vm.entries = vm.uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];

      populateOptionMenu();

    } // activate

    activate();
  }
})();
