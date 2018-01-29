require('./_user-delete.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('UserDeleteCtrl', UserDeleteCtrl);

  /* @ngInject */
  function UserDeleteCtrl($scope, $rootScope, $stateParams, $timeout, $translate, Notification, SunlightConfigService, Userservice, Config, SyncService) {
    var vm = this;

    vm.deleteUserOrgId = $stateParams.deleteUserOrgId;
    vm.deleteUserUuId = $stateParams.deleteUserUuId;
    vm.deleteUsername = $stateParams.deleteUsername;
    vm.deleteUserEntitlements = [];
    vm.isMsgrUser = false;
    vm.msgrloaded = false;

    vm.confirmation = '';
    var confirmationMatch = $translate.instant('usersPage.yes');

    vm.deleteCheck = deleteCheck;
    vm.deactivateUser = deactivateUser;
    vm.orgAdminUrl = 'https://wapi.webexconnect.com/wbxconnect/acs/widgetserver/mashkit/apps/standalone.html?app=WBX.base.orgadmin';

    init();

    function checkMessengerSyncStatus() {
      vm.isMsgrUser = false;
      vm.msgrloaded = false;
      SyncService.isMessengerSyncEnabled()
        .then(function (isEnabled) {
          if (isEnabled) {
            if (_.includes(vm.deleteUserEntitlements, Config.entitlements.messenger)) {
              vm.isMsgrUser = true;
            }
            vm.msgrloaded = true;
          } else {
            vm.msgrloaded = true;
          }
        }, function error() {
          vm.isMsgrUser = false;
        });
    }

    function init() {
      Userservice.getUser(vm.deleteUserUuId, _.noop).then(function (response) {
        var data = response.data;
        data = _.isObject(data) ? data : {};
        vm.deleteUserEntitlements = data.entitlements;
        checkMessengerSyncStatus();
      }, function error() {
        checkMessengerSyncStatus();
      });
    }

    function deleteCheck() {
      return vm.confirmation.toUpperCase() !== confirmationMatch;
    }

    function deactivateUser() {
      startLoading();
      deleteUser()
        .then(deleteSuccess)
        .then(closeModal)
        .catch(deleteError)
        .finally(stopLoading);
    }

    function startLoading() {
      vm.loading = true;
    }

    function deleteUser() {
      var userData = {
        email: vm.deleteUsername,
      };

      return Userservice.deactivateUser(userData);
    }

    function deleteSuccess() {
      Notification.success('usersPage.deleteUserSuccess', {
        email: vm.deleteUsername,
      });

      var userId = vm.deleteUserUuId;

      if (_.includes(vm.deleteUserEntitlements, Config.entitlements.care)) {
        SunlightConfigService.deleteUser(userId)
          .then(deleteFromCareSuccess)
          .catch(deleteFromCareFailure);
      }
      $timeout(refreshUserList, 500);
    }

    function deleteFromCareSuccess() {
      Notification.success('usersPage.deleteCareUserSuccess', {
        email: vm.deleteUsername,
      });
    }

    function deleteFromCareFailure(response) {
      if (response.status == 404) {
        return;
      }
      Notification.errorResponse(response, 'usersPage.deleteCareUserFailure', {
        email: vm.deleteUsername,
      });
    }

    function refreshUserList() {
      $rootScope.$broadcast('USER_LIST_UPDATED');
    }

    function closeModal() {
      if (_.isFunction($scope.$close)) {
        $scope.$close();
      }
    }

    function deleteError(response) {
      var messageKey = 'usersPage.deleteUserError';
      var message = _.get(response, 'data.message');
      if (_.includes(message, 'DN_IS_FALLBACK')) {
        messageKey = 'usersPage.deleteUserDnFallbackError';
      }
      Notification.errorResponse(response, messageKey);
    }

    function stopLoading() {
      vm.loading = false;
    }
  }
})();
