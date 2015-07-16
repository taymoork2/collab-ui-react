'use strict';

angular.module('Core')
  .controller('UserDeleteCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'Log', 'Userservice', 'Notification', 'Config', '$translate', 'HuronUser',
    function ($scope, $rootScope, $state, $stateParams, Log, Userservice, Notification, Config, $translate, HuronUser) {

      $scope.deleteUserOrgId = $stateParams.deleteUserOrgId;
      $scope.deleteUserUuId = $stateParams.deleteUserUuId;
      $scope.deleteUsername = $stateParams.deleteUsername;
      $scope.deleteUserdisplayName = $stateParams.deleteUserdisplayName;
      $scope.userName = $stateParams.userName;

      $scope.inputstr = {
        response: ""
      };
      $scope.patt = $translate.instant('usersPage.yes');

      $scope.deleteCheck = function () {
        if ($scope.inputstr.response.toUpperCase() === $scope.patt) {
          return false;
        } else {
          return true;
        }
      };

      function deleteSuccess() {
        angular.element('#deleteButton').button('reset');
        Notification.notify([$translate.instant('usersPage.deleteUserSuccess', {
          email: $scope.deleteUsername
        })], 'success');

        setTimeout(function () {
          $rootScope.$broadcast('USER_LIST_UPDATED');
        }, 500);
      }

      function deleteHuron() {
        HuronUser.delete($scope.deleteUserUuId)
          .then(function () {
            deleteSuccess();
          })
          .catch(function (response) {
            if (response.status !== 404) {
              Notification.errorResponse(response);
            } else {
              deleteSuccess();
            }
          });
      }

      $scope.deactivateUser = function () {
        Log.debug('Deactivating user: ' + $scope.deleteUserUuId + ' with data: ');
        Userservice.deactivateUser($scope.deleteUserOrgId, $scope.deleteUserUuId)
          .success(function (data, status) {
            deleteHuron();
          })
          .error(function (response) {
            Notification.errorResponse(response);
          });
        $scope.$dismiss();
      };
    }
  ]);
