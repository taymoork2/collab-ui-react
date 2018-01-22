require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageActiveDirController', UserManageActiveDirController);

  /* @ngInject */
  function UserManageActiveDirController(Authinfo, FeatureToggleService, OnboardService, $state, $timeout, UserCsvService) {
    var vm = this;

    vm.isUserAdmin = isUserAdmin;
    vm.onInit = onInit;
    vm.onNext = onNext;
    vm.onTurnOffDS = onTurnOffDS;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.onInit();

    var isAtlasEmailSuppressToggle = false;
    vm.ManageType = require('./userManage.keys').ManageType;

    //////////////////
    function onInit() {
      FeatureToggleService.atlasEmailSuppressGetStatus().then(function (toggle) {
        isAtlasEmailSuppressToggle = toggle;
      });
    }

    function isUserAdmin() {
      return Authinfo.isUserAdminUser();
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
          case vm.ManageType.MANUAL:
            $state.go('users.add.manual');
            break;

          case vm.ManageType.BULK:
            $state.go('users.csv');
            break;

          case vm.ManageType.ADVANCED_DS:
            $state.go('users.manage.dir-sync.add.ob.syncStatus');
            break;
        }
      }
    }
  }
})();
