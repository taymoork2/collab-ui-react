'use strict';

angular.module('Core')
  .controller('UserDeleteCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'Log', 'Userservice', 'Notification', 'Config', '$translate', 'HuronUser',
    function ($scope, $rootScope, $state, $stateParams, $q, Log, Userservice, Notification, Config, $translate, HuronUser) {

      $scope.deleteUserOrgId = $stateParams.deleteUserOrgId;
      $scope.deleteUserUuId = $stateParams.deleteUserUuId;
      $scope.deleteUsername = $stateParams.deleteUsername;

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
        var userData = {
          email: $scope.deleteUsername
        };
        Log.debug('Deactivating user ' + $scope.deleteUsername);
        Userservice.deactivateUser(userData)
          .success(function (data, status) {
            deleteHuron();
            if (angular.isFunction($scope.$dismiss)) {
              $scope.$dismiss();
            }
          })
          .error(function (data, status) {
            Log.warn('Could not delete the user', data);
            var error = null;
            if (status) {
              error = $translate.instant('usersPage.statusError', {
                status: status
              });
              if (data && angular.isString(data.message)) {
                error += ' ' + $translate.instant('usersPage.messageError', {
                  message: data.message
                });
              }
            } else {
              error = 'Request failed.';
              if (angular.isString(data)) {
                error += ' ' + data;
              }
              Notification.notify(error, 'error');
            }
            Notification.notify([error], 'error');
            angular.element('#deleteButton').button('reset');
            deferred.reject();
          });
      };
    }
  ]);
