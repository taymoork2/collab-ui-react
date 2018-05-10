require('./_user-manage.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageModalController', UserManageModalController)
    .controller('UserManageModalPickerController', UserManageModalPickerController);

  ///////////////////////////

  /* @ngInject */
  function UserManageModalController($state, Analytics) {
    var vm = this;

    vm.onInit = onInit;
    vm.cancelModal = cancelModal;

    vm.onInit();

    ///////////////////////

    function onInit() {
    }

    function cancelModal() {
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
      $state.modal.dismiss();
    }
  }

  /////////////////////////

  /* @ngInject */
  function UserManageModalPickerController($state, $q, DirSyncService) {
    var vm = this;

    vm.onInit = onInit;

    vm.onInit();

    //////////////////
    function onInit() {
      var promises = {
        dirSyncPromise: (DirSyncService.requiresRefresh() ? DirSyncService.refreshStatus() : $q.resolve()),
      };

      $q.all(promises).then(function (response) {
        // Should not got to activedir state when the feature toggle is active
        if (DirSyncService.isDirSyncEnabled() && !true) {
          $state.go('users.manage.activedir');
        } else {
          $state.go('users.manage.org');
        }
      });
    }
  }
}
)();
