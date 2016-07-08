(function () {
  'use strict';

  angular.module('Sunlight')
    .controller('SunlightUserOverviewCtrl', SunlightUserOverviewCtrl);

  /* @ngInject */
  function SunlightUserOverviewCtrl($state, $stateParams, SunlightConfigService, Notification, $translate, Log) {

    var vm = this;

    vm.currentUser = $stateParams.currentUser;
    vm.userData = {};

    /* User alias */
    vm.aliasFormModel = [];
    vm.aliasMessages = {
      required: $translate.instant('common.invalidRequired')
    };

    vm.alias = [{
      key: 'sunlightUserAlias',
      type: 'input',
      templateOptions: {
        type: 'text',
        required: true,
        maxlength: 50
      }
    }];

    /* User roles */
    vm.roles = [
      $translate.instant('contactCenterUserConfig.userRoles.user'),
      $translate.instant('contactCenterUserConfig.userRoles.supervisor')
    ];

    /* By default "User" role is selected for new user */
    vm.roleSelected = vm.roles[0];

    vm.closePreview = function () {
      $state.go('users.list');
    };

    vm.showSaveCancel = function () {
      vm.saveCancelEnabled = true;
    };

    vm.hideSaveCancel = function () {
      vm.saveCancelEnabled = false;
    };

    /* Updates Sunlight user info in sunlight config service */
    vm.updateUserData = function (userId) {

      var updatedUserInfo = getUpdatedUserData();

      if (!updatedUserInfo.alias) {
        Notification.error('contactCenterUserConfig.failureMessages.emptyAliasErrorMessage', {
          userId: vm.currentUser.userName
        });
        return;
      }

      SunlightConfigService.updateUserInfo(updatedUserInfo, userId)
        .then(function (response) {
          vm.hideSaveCancel();
          Notification.success('contactCenterUserConfig.successMessages.userUpdateSuccessMessage', {
            userId: vm.currentUser.userName
          });

        }, function (response) {
          Log.debug('Failed to save sunlight user information in sunlight config Service. Status: ' + response.status + ' statusText: ' + response.statusText);
          Notification.error('contactCenterUserConfig.failureMessages.userUpdateFailureMessage', {
            userId: vm.currentUser.userName
          });
        });
    };

    vm.setUserInfoView = function (data) {
      vm.hideSaveCancel();

      vm.roleSelected = $translate.instant('contactCenterUserConfig.userRoles.' + data.role);
      vm.aliasFormModel.sunlightUserAlias = data.alias;
      vm.currentUser.teamId = data.teamId;
    };

    vm.loadUserInformation = function (userId) {

      SunlightConfigService.getUserInfo(userId)
        .then(function (response) {
          var data = response.data || {};
          vm.userData = data;
          vm.setUserInfoView(vm.userData);

        }, function (response) {
          Log.debug('Failed to retrieve sunlight user information from sunlight config Service with Status: ' + response.status + ' statusText: ' + response.statusText);
          Notification.error('contactCenterUserConfig.failureMessages.userloadFailureMessage', {
            userId: vm.currentUser.userName
          });
        });
    };

    vm.loadUserInformation(vm.currentUser.id);

    function getUpdatedUserData() {
      var userData = {};

      userData.alias = vm.aliasFormModel.sunlightUserAlias;
      userData.teamId = vm.currentUser.teamId;
      userData.attributes = [];
      userData.media = ['chat'];
      userData.role = 'user';

      return userData;
    }
  }
})();
