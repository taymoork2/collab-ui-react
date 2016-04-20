(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('HybridServicesPreviewCtrl', HybridServicesPreviewCtrl);

  /*@ngInject*/
  function HybridServicesPreviewCtrl($log, $scope, $rootScope, $state, $stateParams, Authinfo, Userservice, Notification, USSService, ClusterService, $timeout) {
    $scope.entitlementNames = {
      'squared-fusion-cal': 'squaredFusionCal',
      'squared-fusion-uc': 'squaredFusionUC'
    };
    $scope.currentUser = $stateParams.currentUser;
    var isEntitled = function () {
      return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf($stateParams.extensionId) > -1 ? true : false;
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
            entitleResult.msg = 'Entitlements for ' + $scope.currentUser.userName + ' do not exist.';
            entitleResult.type = 'error';
          } else if (userStatus === 409) {
            entitleResult.msg = 'Entitlement(s) previously updated.';
            entitleResult.type = 'error';
          } else {
            entitleResult.msg = $scope.currentUser.userName + '\'s entitlements were not updated, status: ' + userStatus;
            entitleResult.type = 'error';
          }
          if (userStatus !== 200) {
            Notification.notify([entitleResult.msg], entitleResult.type);
          }
          $scope.btn_saveLoad = false;

        } else {
          entitleResult = {
            msg: 'Failed to update ' + $scope.currentUser.userName + '\'s entitlements.',
            type: 'error'
          };
          Notification.notify([entitleResult.msg], entitleResult.type);
          $scope.btn_saveLoad = false;
        }
        $scope.saving = false;
      });
    };

    $scope.resetEntitlement = function () {
      $scope.extension.entitled = $scope.currentUser.entitlements.indexOf($stateParams.extensionId) > -1 ? true : false;
    };

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };
  }
}());
