require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageEmailSuppressController', UserManageEmailSuppressController);

  /* @ngInject */
  function UserManageEmailSuppressController($state, $stateParams, Analytics, Orgservice) {
    var vm = this;

    vm.onInit = onInit;
    vm.dataLoaded = false;
    vm.isEmailSuppressed = false;
    vm.isSparkCallEnabled = false;
    vm.cancelModal = cancelModal;
    vm.onBack = onBack;
    vm.onNext = onNext;
    vm.onInit();

    var manageType = $stateParams.manageType;
    var prevState = $stateParams.prevState;

    //////////////////
    function onInit() {
      // Check isEmailSuppressed status
      Orgservice.getAdminOrgAsPromise(null, { basicInfo: true }).then(function (response) {
        if (response.success) {
          var isOnBoardingEmailSuppressed = response.data.isOnBoardingEmailSuppressed || false;
          vm.isEmailSuppressed = isOnBoardingEmailSuppressed;

          // Check isSparkCallEnabled status
          vm.isSparkCallEnabled = !!_.find(response.data.licenses, function (license) {
            return _.startsWith(license.licenseId, 'CO_');
          });
          vm.dataLoaded = true;
        }
      });
    }

    function cancelModal() {
      $state.modal.dismiss();
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
    }

    function onBack() {
      $state.go(prevState);
    }

    function onNext() {
      switch (manageType) {
        case 'manual':
          Analytics.trackAddUsers(Analytics.eventNames.NEXT, Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
          $state.go('users.add');
          break;

        case 'bulk':
          Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, Analytics.sections.ADD_USERS.uploadMethods.CSV);
          $state.go('users.csv');
          break;

        case 'advancedNoDS':
          Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, Analytics.sections.ADD_USERS.uploadMethods.SYNC);
          $state.go('users.manage.advanced.add.ob.installConnector');
          break;

        case 'convert':
          $state.go('users.convert', {
            manageUsers: true,
          });
          break;

        case 'advancedDS':
          $state.go('users.manage.advanced.add.ob.syncStatus');
          break;
      }
    }
  }
})();
