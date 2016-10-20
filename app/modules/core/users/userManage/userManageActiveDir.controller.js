(function () {
  'use strict';

  angular.module('Core')
    .controller('UserManageActiveDirController', UserManageActiveDirController);

  /* @ngInject */
  function UserManageActiveDirController($state, $modal, $resource, UrlConfig, Authinfo, UserCsvService, OnboardService, Notification) {
    var vm = this;

    vm.onInit = onInit;
    vm.onNext = onNext;
    vm.onTurnOffDS = onTurnOffDS;
    vm.manageType = 'manual';
    vm.maxUsersInCSV = UserCsvService.maxUsersInCSV;
    vm.maxUsersInManual = OnboardService.maxUsersInManual;
    var dirSyncResource = $resource(UrlConfig.getAdminServiceUrl() + 'organization/:customerId/dirsync/mode?enabled=false', {
      customerId: '@customerId'
    }, {
      patch: {
        method: 'PATCH'
      }
    });

    vm.onInit();

    //////////////////
    function onInit() {}

    function onTurnOffDS() {
      $modal.open({
        type: 'dialog',
        templateUrl: 'modules/core/users/userManage/userManageActiveDirDisableConfirm.tpl.html'
      }).result.then(function () {
        dirSyncResource.patch({
          customerId: Authinfo.getOrgId()
        }).$promise.then(
          function () {
            Notification.success('userManage.ad.dirSyncDisableSuccess');
            $state.go('users.manage.org');
          },
          function (response) {
            Notification.error(Notification.processErrorResponse(response, 'userManage.ad.dirSyncDisableFailure'));
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
