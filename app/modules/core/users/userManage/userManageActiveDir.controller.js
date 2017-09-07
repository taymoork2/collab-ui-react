require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageActiveDirController', UserManageActiveDirController);

  /* @ngInject */
  function UserManageActiveDirController(FeatureToggleService, OnboardService, $state, $timeout, UserCsvService) {
    var vm = this;

    vm.onInit = onInit;
    vm.onNext = onNext;
    vm.onTurnOffDS = onTurnOffDS;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.onInit();

    var isAtlasEmailSuppressToggle = false;

    //////////////////
    function onInit() {
      FeatureToggleService.atlasEmailSuppressGetStatus().then(function (toggle) {
        isAtlasEmailSuppressToggle = toggle;
      });
    }

    function onTurnOffDS() {
      $state.modal.dismiss();
      $timeout(function () {
        $state.go('settings', {
          showSettings: 'dirsync',
        });
      });
    }

    function onNext() {
      if (isAtlasEmailSuppressToggle) {
        $state.go('users.manage.emailSuppress', {
          manageType: vm.manageType,
          prevState: 'users.manage.activedir',
        });
      } else {
        switch (vm.manageType) {
          case 'manual':
            $state.go('users.add');
            break;

          case 'bulk':
            $state.go('users.csv');
            break;

          case 'advancedDS':
            $state.go('users.manage.advanced.add.ob.syncStatus');
            break;
        }
      }
    }
  }
})();
