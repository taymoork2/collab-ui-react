require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageActiveDirController', UserManageActiveDirController);

  /* @ngInject */
  function UserManageActiveDirController($state, UserCsvService, OnboardService, $timeout) {
    var vm = this;

    vm.onInit = onInit;
    vm.onNext = onNext;
    vm.onTurnOffDS = onTurnOffDS;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;

    vm.onInit();

    //////////////////
    function onInit() { }

    function onTurnOffDS() {
      $state.modal.dismiss();
      $timeout(function () {
        $state.go('settings', {
          showSettings: 'dirsync',
        });
      });
    }

    function onNext() {
      switch (vm.manageType) {
        case 'manual':
          $state.go('users.add');
          break;

        case 'bulk':
          $state.go('users.csv');
          break;

        case 'advanced':
          $state.go('users.manage.advanced.add.ob.syncStatus');
          break;
      }
    }
  }

})();
