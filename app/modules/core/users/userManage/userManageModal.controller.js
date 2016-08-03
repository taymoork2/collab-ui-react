(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageModalController', UserManageModalController);

  /* @ngInject */
  function UserManageModalController(FeatureToggleService, $state) {
    var vm = this;

    vm.onInit = onInit;

    vm.onInit();

    ///////////////////////

    function onInit() {

      vm.isDirSyncEnabled = false;

      // Is DirSync enabled or not? Our options depend on it.
      FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
        vm.isDirSyncEnabled = dirSyncEnabled;
        if (dirSyncEnabled) {
          $state.go('users.manage.activedir');
        } else {
          $state.go('users.manage.org');
        }
      });

    }
  }
})();
