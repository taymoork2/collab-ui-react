require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageOrgController', UserManageOrgController);

  /* @ngInject */
  function UserManageOrgController(Analytics, FeatureToggleService, OnboardService, Orgservice, $state, UserCsvService) {
    var vm = this;

    vm.onInit = onInit;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    vm.onNext = onNext;
    vm.cancelModal = cancelModal;
    vm.convertableUsers = false;
    vm.onInit();

    var isAtlasEmailSuppressToggle = false;
    vm.ManageType = require('./userManage.keys').ManageType;

    //////////////////
    function onInit() {
      Orgservice.getUnlicensedUsers(function (data) {
        if (data.success && data.totalResults > 0) {
          vm.convertableUsers = true;
        }
      });
      FeatureToggleService.atlasEmailSuppressGetStatus().then(function (toggle) {
        isAtlasEmailSuppressToggle = toggle;
      });
    }

    function cancelModal() {
      $state.modal.dismiss();
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
    }

    function onNext() {
      if (isAtlasEmailSuppressToggle) {
        $state.go('users.manage.emailSuppress', {
          manageType: vm.manageType,
          prevState: 'users.manage.org',
        });
      } else {
        switch (vm.manageType) {
          case vm.ManageType.MANUAL:
            Analytics.trackAddUsers(Analytics.eventNames.NEXT, Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
            $state.go('users.add');
            break;

          case vm.ManageType.BULK:
            Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, Analytics.sections.ADD_USERS.uploadMethods.CSV);
            $state.go('users.csv');
            break;

          case vm.ManageType.ADVANCED_NO_DS:
            Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, Analytics.sections.ADD_USERS.uploadMethods.SYNC);
            $state.go('users.manage.advanced.add.ob.installConnector');
            break;

          case vm.ManageType.CONVERT:
            $state.go('users.convert', {
              manageUsers: true,
            });
            break;
        }
      }
    }
  }
})();
