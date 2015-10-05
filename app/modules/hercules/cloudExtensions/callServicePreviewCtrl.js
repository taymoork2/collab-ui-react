'use strict';

angular.module('Hercules')
  .controller('CallServicePreviewCtrl', ['$log', '$scope', '$rootScope', '$state', '$stateParams', 'Authinfo', 'Userservice', 'Notification', 'USSService', 'ClusterService', '$timeout',
    function ($log, $scope, $rootScope, $state, $stateParams, Authinfo, Userservice, Notification, USSService, ClusterService, $timeout) {
      $scope.currentUser = $stateParams.currentUser;
      var isEntitled = function (ent) {
        return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf(ent) > -1 ? true : false;
      };

      var sipUri = _.find($scope.currentUser.sipAddresses, {
        type: "enterprise"
      });
      var enterpriseDn = _.find($scope.currentUser.phoneNumbers, {
        type: "work"
      });

      $scope.callServiceAware = {
        id: 'squared-fusion-uc',
        name: 'squaredFusionUC',
        entitled: isEntitled('squared-fusion-uc'),
        sipUri: sipUri ? sipUri.value : null
      };
      $scope.callServiceConnect = {
        id: 'squared-fusion-ec',
        name: 'squaredFusionEC',
        entitled: isEntitled('squared-fusion-ec'),
        orgEntitled: Authinfo.isFusionEC(),
        huronEntitled: isEntitled('ciscouc'),
        enterpriseDn: enterpriseDn ? enterpriseDn.value : null
      };

      $scope.$watch('callServiceAware.entitled', function (newVal, oldVal) {
        if (newVal != oldVal) {
          $scope.showButtons = newVal != isEntitled($scope.callServiceAware.id) || $scope.callServiceConnect.entitled != isEntitled($scope.callServiceConnect.id);
        }
      });

      $scope.$watch('callServiceConnect.entitled', function (newVal, oldVal) {
        if (newVal != oldVal) {
          $scope.showButtons = newVal != isEntitled($scope.callServiceConnect.id) || $scope.callServiceAware.entitled != isEntitled($scope.callServiceAware.id);
        }
      });

      var updateStatus = function () {
        USSService.getStatusesForUser($scope.currentUser.id, function (err, activationStatus) {
          if (!activationStatus || !activationStatus.userStatuses) {
            return;
          }
          $scope.callServiceAware.status = _.find(activationStatus.userStatuses, function (status) {
            return $scope.callServiceAware.id === status.serviceId;
          });
          if ($scope.callServiceAware.status && $scope.callServiceAware.status.connectorId) {
            ClusterService.getConnector($scope.callServiceAware.status.connectorId).then(function (connector) {
              $scope.callServiceAware.homedConnector = connector;
            });
          }
        });
      };

      updateStatus();

      $scope.updateEntitlements = function () {
        $scope.saving = true;
        var user = [{
          'address': $scope.currentUser.userName
        }];
        var entitlements = [{
          entitlementName: $scope.callServiceAware.name,
          entitlementState: $scope.callServiceAware.entitled === true ? 'ACTIVE' : 'INACTIVE'
        }];
        /*if ($scope.callServiceConnect.orgEntitled) {
         // Bring back when the entitlement support in Atlas is in place
         entitlements.push({
         entitlementName: $scope.callServiceConnect.name,
         entitlementState: $scope.callServiceAware.entitled === true && $scope.callServiceConnect.entitled === true && $scope.callServiceConnect.huronEntitled !== true ? 'ACTIVE' : 'INACTIVE'
         });
         }*/

        angular.element('#btn-save').button('loading');

        Userservice.updateUsers(user, null, entitlements, 'updateEntitlement', function (data) {
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
              if ($scope.callServiceAware.entitled) {
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
            angular.element('#btn-save').button('reset');

          } else {
            entitleResult = {
              msg: 'Failed to update ' + $scope.currentUser.userName + '\'s entitlements.',
              type: 'error'
            };
            Notification.notify([entitleResult.msg], entitleResult.type);
            angular.element('#btn-save').button('reset');
          }
          $scope.saving = false;
        });
      };

      $scope.resetEntitlements = function () {
        $scope.callServiceAware.entitled = isEntitled($scope.callServiceAware.id);
        $scope.callServiceConnect.entitled = isEntitled($scope.callServiceConnect.id);
      };

      $scope.closePreview = function () {
        $state.go('users.list');
      };

      $scope.getStatus = function (status) {
        return USSService.decorateWithStatus(status);
      };

      var findEnterpriseSipUri = function () {
        USSService.getStatusesForUser($scope.currentUser.id, function (err, activationStatus) {
          if (!activationStatus || !activationStatus.userStatuses) {
            return;
          }
          $scope.callServiceAware.status = _.find(activationStatus.userStatuses, function (status) {
            return $scope.callServiceAware.id === status.serviceId;
          });
          if ($scope.callServiceAware.status && $scope.callServiceAware.status.connectorId) {
            ClusterService.getConnector($scope.callServiceAware.status.connectorId).then(function (connector) {
              $scope.callServiceAware.homedConnector = connector;
            });
          }
        });
      };
    }
  ]);
