require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageModalController', UserManageModalController);

  /* @ngInject */
  function UserManageModalController($state, $stateParams, Analytics, FeatureToggleService) {
    var vm = this;

    vm.onInit = onInit;
    vm.cancelModal = cancelModal;

    vm.onInit();

    ///////////////////////

    function onInit() {

      vm.isDirSyncEnabled = false;
      vm.isOverExportThreshold = !!$stateParams.isOverExportThreshold;

      // Is DirSync enabled or not? Our options depend on it.
      FeatureToggleService.supportsDirSync()
        .then(function (dirSyncEnabled) {
          vm.isDirSyncEnabled = dirSyncEnabled;
          if (dirSyncEnabled) {
            $state.go('users.manage.activedir');
          } else {
            $state.go('users.manage.org');
          }
        });

    }

    function cancelModal() {
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
      $state.modal.dismiss();
    }
  }
})();
