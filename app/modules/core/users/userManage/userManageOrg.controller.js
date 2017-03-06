require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageOrgController', UserManageOrgController);

  /* @ngInject */
  function UserManageOrgController($state, Analytics, UserCsvService, OnboardService, Orgservice) {
    var vm = this;

    vm.onInit = onInit;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.onNext = onNext;
    vm.cancelModal = cancelModal;
    vm.convertableUsers = false;

    vm.onInit();

    //////////////////
    function onInit() {
      Orgservice.getUnlicensedUsers(function (data) {
        if (data.success && data.totalResults > 0) {
          vm.convertableUsers = true;
        }
      });
    }

    function cancelModal() {
      $state.modal.dismiss();
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
    }

    function onNext() {
      switch (vm.manageType) {
        case 'manual':
          Analytics.trackAddUsers(Analytics.eventNames.NEXT, Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
          $state.go('users.add');
          break;

        case 'bulk':
          Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, Analytics.sections.ADD_USERS.uploadMethods.CSV);
          $state.go('users.csv');
          break;

        case 'advanced':
          Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, Analytics.sections.ADD_USERS.uploadMethods.SYNC);
          $state.go('users.manage.advanced.add.ob.installConnector');
          break;

        case 'convert':
          $state.go('users.convert', {
            manageUsers: true,
          });
          break;
      }
    }

  }

})();
