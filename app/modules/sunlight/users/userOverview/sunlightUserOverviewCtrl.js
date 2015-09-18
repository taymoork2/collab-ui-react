(function () {
  'use strict';

  angular.module('Sunlight')
    .controller('SunlightUserOverviewCtrl', SunlightUserOverviewCtrl);

  /* @ngInject */
  function SunlightUserOverviewCtrl($state, $stateParams, SunlightConfigService, Notification, $translate, formlyValidationMessages, Log) {
    /*jshint validthis: true */

    var vm = this;

    vm.currentUser = $stateParams.currentUser;
    vm.userData = {};

    /* Contact center media cannels */
    vm.mediaInfo = [{
      "name": "chat",
      "enabled": false
    }, {
      "name": "email",
      "enabled": false
    }, {
      "name": "voice",
      "enabled": false
    }];

    /* User alias */
    vm.aliasFormModel = [];
    vm.aliasMessages = {
      required: $translate.instant('common.invalidRequired')
    };

    formlyValidationMessages.addStringMessage('required', vm.aliasMessages.required);

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
        Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.emptyAliasErrorMessage') + vm.currentUser.userName], 'error');
        return;
      }

      SunlightConfigService.updateUserInfo(updatedUserInfo, userId).then(function (data) {

        vm.hideSaveCancel();
        Notification.notify([$translate.instant('contactCenterUserConfig.successMessages.userUpdateSuccessMessage') + vm.currentUser.userName], 'success');

      }, function (data) {

        Log.debug('Failed to save sunlight user information in sunlight config Service. Status: ' + status);
        Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.userUpdateFailureMessage') + vm.currentUser.userName], 'error');

      });
    };

    vm.setUserInfoView = function (data) {
      vm.hideSaveCancel();

      for (var i = 0; i < vm.mediaInfo.length; i++) {
        if (data.media.lastIndexOf(vm.mediaInfo[i].name) !== -1) {
          vm.mediaInfo[i].enabled = true;
        } else {
          vm.mediaInfo[i].enabled = false;
        }
      }
      vm.roleSelected = $translate.instant('contactCenterUserConfig.userRoles.' + data.role);
      vm.aliasFormModel.sunlightUserAlias = data.alias;
      vm.currentUser.teamId = data.teamId;
    };

    vm.loadUserInformation = function (userId) {

      SunlightConfigService.getUserInfo(userId).then(function (data) {
        vm.userData = data;
        vm.setUserInfoView(vm.userData);

      }, function (data) {
        Log.debug('Failed to retrieve sunlight user information from sunlight config Service with error : ' + JSON.stringify(data));
        Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.userloadFailureMessage') + vm.currentUser.userName], 'error');
      });

    };

    vm.loadUserInformation(vm.currentUser.id);

    function getUpdatedUserData() {
      var userData = {};

      userData.alias = vm.aliasFormModel.sunlightUserAlias;
      userData.teamId = vm.currentUser.teamId;
      userData.attributes = [];
      userData.media = [];

      if (vm.roleSelected === $translate.instant('contactCenterUserConfig.userRoles.supervisor')) {
        userData.role = 'supervisor';
      } else {
        userData.role = 'user';
      }

      for (var i = 0; i < vm.mediaInfo.length; i++) {
        if (vm.mediaInfo[i].enabled) {
          userData.media.push(vm.mediaInfo[i].name);
        }
      }
      return userData;
    }
  }
})();
