(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageOrgController', UserManageOrgController);

  /* @ngInject */
  function UserManageOrgController($state, UserCsvService, OnboardService) {
    var vm = this;

    vm.onInit = onInit;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.onNext = onNext;

    vm.onInit();

    //////////////////
    function onInit() {

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
          $state.go('users.manage.advanced.add.ob.installConnector');
          break;
      }
    }

  }

})();
