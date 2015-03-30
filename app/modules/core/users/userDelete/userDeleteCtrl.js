'use strict';

angular.module('Core')
  .controller('UserDeleteCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'Log', 'Userservice', 'Notification', 'Config', '$translate',
    function ($scope, $rootScope, $state, $stateParams, Log, Userservice, Notification, Config, $translate) {

      $scope.deleteUserOrgId = $stateParams.deleteUserOrgId;
      $scope.deleteUserUuId = $stateParams.deleteUserUuId;
      $scope.deleteUsername = $stateParams.deleteUsername;

      $scope.deactivateUser = function () {

        var userData = {
          'schemas': Config.scimSchemas,
          'active': false,
          'meta': {
            'attributes': ['entitlements']
          },
        };

        Log.debug('Deactivating user: ' + $scope.deleteUserUuId + ' with data: ');
        Log.debug(userData);

        Userservice.deactivateUser($scope.deleteUserOrgId, $scope.deleteUserUuId, userData, function (data, status) {
          if (data.success) {
            angular.element('#deleteButton').button('reset');
            Notification.notify([$translate.instant('usersPage.deleteUserSuccess', {
              email: $scope.deleteUsername
            })], 'success');
            setTimeout(function () {
              $rootScope.$broadcast('USER_LIST_UPDATED');
            }, 500);
          } else {
            Notification.notify([$translate.instant('usersPage.deleteUserError', {
              status: status
            })], 'error');
          }
        });
        $scope.$dismiss();
      };
    }
  ]);
