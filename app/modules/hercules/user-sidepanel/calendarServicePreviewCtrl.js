(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarServicePreviewCtrl', CalendarServicePreviewCtrl);

  /*@ngInject*/
  function CalendarServicePreviewCtrl($scope, $state, $stateParams, Userservice, Notification, USSService, ClusterService, $timeout, $translate) {
    $scope.entitlementNames = {
      'squared-fusion-cal': 'squaredFusionCal',
      'squared-fusion-uc': 'squaredFusionUC'
    };

    $scope.currentUser = $stateParams.currentUser;
    $scope.isInvitePending = Userservice.isInvitePending($scope.currentUser);
    $scope.localizedServiceName = $translate.instant('hercules.serviceNames.' + $stateParams.extensionId);
    $scope.localizedOnboardingWarning = $translate.instant('hercules.userSidepanel.warningInvitePending', {
      ServiceName: $scope.localizedServiceName
    });

    var isEntitled = function () {
      return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf($stateParams.extensionId) > -1;
    };
    $scope.extension = {
      id: $stateParams.extensionId,
      entitled: isEntitled()
    };

    $scope.$watch('extension.entitled', function (newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.showButtons = newVal != isEntitled();
      }
    });

    var updateStatus = function () {
      USSService.getStatusesForUser($scope.currentUser.id, function (err, activationStatus) {
        if (!activationStatus || !activationStatus.userStatuses) {
          return;
        }
        $scope.extension.status = _.find(activationStatus.userStatuses, function (status) {
          return $scope.extension.id === status.serviceId;
        });
        if ($scope.extension.status && $scope.extension.status.connectorId) {
          ClusterService.getConnector($scope.extension.status.connectorId).then(function (connector) {
            $scope.extension.homedConnector = connector;
          });
        }
      });
    };

    updateStatus();

    $scope.updateEntitlement = function (entitled) {
      $scope.saving = true;
      var user = [{
        'address': $scope.currentUser.userName
      }];
      var entitlement = [{
        entitlementName: $scope.entitlementNames[$stateParams.extensionId],
        entitlementState: entitled === true ? 'ACTIVE' : 'INACTIVE'
      }];
      $scope.btn_saveLoad = true;

      Userservice.updateUsers(user, null, entitlement, 'updateEntitlement', function (data) {
        var entitleResult = {
          msg: null,
          type: 'null'
        };
        if (data.success) {
          var userStatus = data.userResponse[0].status;
          if (userStatus === 200) {
            if (!$stateParams.currentUser.entitlements) {
              $stateParams.currentUser.entitlements = [];
            }
            $stateParams.currentUser.entitlements.push($stateParams.extensionId);
            $scope.showButtons = false;
            if (entitled) {
              $timeout(function () {
                updateStatus();
              }, 2000); // Wait a few seconds and update the status after successful enable
            }
          } else if (userStatus === 404) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.entitlements-dont-exist', {
              userName: $scope.currentUser.userName
            });
            entitleResult.type = 'error';
          } else if (userStatus === 409) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.previously-updated');
            entitleResult.type = 'error';
          } else {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName
            });
            entitleResult.type = 'error';
          }
          if (userStatus !== 200) {
            Notification.notify([entitleResult.msg], entitleResult.type);
          }
          $scope.btn_saveLoad = false;

        } else {
          entitleResult = {
            msg: $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName
            }),
            type: 'error'
          };
          Notification.notify([entitleResult.msg], entitleResult.type);
          $scope.btn_saveLoad = false;
        }
        $scope.saving = false;
      });
    };

    $scope.resetEntitlement = function () {
      $scope.extension.entitled = $scope.currentUser.entitlements.indexOf($stateParams.extensionId) > -1;
    };

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };

  }
}());
