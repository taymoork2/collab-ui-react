(function () {
  'use strict';

  angular.module('Sunlight')
    .controller('SunlightUserOverviewCtrl', SunlightUserOverviewCtrl);

  /* @ngInject */
  function SunlightUserOverviewCtrl($scope, $state, $stateParams, SunlightConfigService, Notification, $translate, formlyValidationMessages, Log) {
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
      key: 'alias',
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
    vm.roleSelected = $translate.instant('contactCenterUserConfig.userRoles.user');

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.showSaveCancel = function () {
      $scope.saveCancelEnabled = true;
    };

    $scope.hideSaveCancel = function () {
      $scope.saveCancelEnabled = false;
    };

    /* Updates Sunlight user info in sunlight config service */
    $scope.updateUserInfo = function () {

      var updatedUserInfo = updatedUserData();

      if (!updatedUserInfo.alias) {
        Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.emptyAliasErrorMessage') + vm.currentUser.userName], 'error');
        return;
      }

      SunlightConfigService.updateUserInfo(updatedUserInfo, vm.currentUser.id, function (data, status) {

        if (data.success) {
          $scope.hideSaveCancel();
          Notification.notify([$translate.instant('contactCenterUserConfig.successMessages.userUpdateSuccessMessage') + vm.currentUser.userName], 'success');

        } else {
          Log.debug('Failed to save sunlight user information in sunlight config Service. Status: ' + status);
          Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.userUpdateFailureMessage') + vm.currentUser.userName], 'error');
        }

      });
    };

    $scope.setUserInfoView = function (data) {
      $scope.hideSaveCancel();

      for (var i = 0; i < vm.mediaInfo.length; i++) {
        if (data.media.lastIndexOf(vm.mediaInfo[i].name) !== -1) {
          vm.mediaInfo[i].enabled = true;
        } else {
          vm.mediaInfo[i].enabled = false;
        }
      }
      vm.roleSelected = $translate.instant('contactCenterUserConfig.userRoles.' + data.role);
      vm.aliasFormModel.alias = data.alias;
      vm.currentUser.teamId = data.teamId;
    };

    $scope.loadUserInformation = function () {
      SunlightConfigService.getUserInfo(vm.currentUser.id, function (data, status) {

        if (data.success) {
          vm.userData = data;
          $scope.setUserInfoView(vm.userData);
        } else {
          Log.debug('Failed to retrieve sunlight user information from sunlight config Service. Status: ' + status);
          Notification.notify([$translate.instant('contactCenterUserConfig.failureMessages.userloadFailureMessage') + vm.currentUser.userName], 'error');
        }
      });

    };

    $scope.loadUserInformation();

    function updatedUserData() {
      var userData = {};

      userData.alias = vm.aliasFormModel.alias;
      userData.teamId = vm.currentUser.teamId;
      userData.attributes = [];
      userData.media = [];

      if (vm.roleSelected === $translate.instant('contactCenterUserConfig.userRoles.user')) {
        userData.role = 'user';
      } else {
        userData.role = 'supervisor';
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
