'use strict';

angular.module('Squared')
  .controller('CalendarPreviewCtrl', ['$log', '$scope', '$rootScope', '$state', '$stateParams', 'Authinfo', 'Userservice', 'Notification',
    function ($log, $scope, $rootScope, $state, $stateParams, Authinfo, Userservice, Notification) {
      $scope.currentUser = $stateParams.currentUser;

      $scope.fusionCal = {
        label: 'Calendar Service',
        state: $scope.currentUser.entitlements.indexOf('squared-fusion-cal') > -1 ? true : false
      };

      $scope.updateCalEntitlement = function (state) {
        var user = [{
          'address': $scope.currentUser.userName
        }];
        var entitlement = [{
          entitlementName: 'squaredFusionCal',
          entitlementState: state === true ? 'ACTIVE' : 'INACTIVE'
        }];
        angular.element('#btn-save').button('loading');

        Userservice.updateUsers(user, null, entitlement, function (data) {
          var entitleResult = {
            msg: null,
            type: 'null'
          };
          if (data.success) {
            var userStatus = data.userResponse[0].status;
            if (userStatus === 200) {
              entitleResult.msg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
              entitleResult.type = 'success';
            } else if (userStatus === 404) {
              entitleResult.msg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
              entitleResult.type = 'error';
            } else if (userStatus === 409) {
              entitleResult.msg = 'Entitlement(s) previously updated.';
              entitleResult.type = 'error';
            } else {
              entitleResult.msg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
              entitleResult.type = 'error';
            }
            Notification.notify([entitleResult.msg], entitleResult.type);
            angular.element('#btn-save').button('reset');
            $rootScope.$broadcast('cal-entitlement-updated');
          } else {
            entitleResult = {
              msg: 'Failed to update ' + user.userName + '\'s entitlements.',
              type: 'error'
            };
            Notification.notify([entitleResult.msg], entitleResult.type);
            angular.element('#btn-save').button('reset');
          }
        });
      };

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
