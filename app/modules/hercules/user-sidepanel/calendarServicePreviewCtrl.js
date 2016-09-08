(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarServicePreviewCtrl', CalendarServicePreviewCtrl);

  /*@ngInject*/
  function CalendarServicePreviewCtrl($scope, $state, $stateParams, Userservice, Notification, USSService, ClusterService, $timeout, $translate, ResourceGroupService, FeatureToggleService) {
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
    $scope.resourceGroup = {
      show: false,
      saving: false,
      init: function () {
        this.options = [{ label: $translate.instant('hercules.resourceGroups.noGroupSelected'), value: '' }];
        this.selected = this.current = this.options[0];
      },
      reset: function () {
        this.selected = this.current;
        this.saving = false;
      },
      hasChanged: function () {
        return this.selected !== this.current;
      }
    };
    $scope.resourceGroup.init();

    var isEntitled = function () {
      return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf($stateParams.extensionId) > -1;
    };

    $scope.extension = {
      id: $stateParams.extensionId,
      entitled: isEntitled()
    };

    $scope.$watch('extension.entitled', function (newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    var entitlementHasChanged = function () {
      return $scope.extension.entitled !== isEntitled();
    };

    var updateStatus = function () {
      USSService.getStatusesForUser($scope.currentUser.id).then(function (statuses) {
        $scope.extension.status = _.find(statuses, function (status) {
          return $scope.extension.id === status.serviceId;
        });
        if ($scope.extension.status && $scope.extension.status.connectorId) {
          ClusterService.getConnector($scope.extension.status.connectorId).then(function (connector) {
            $scope.extension.homedConnector = connector;
          });
        }
      });
    };

    var setSelectedResourceGroup = function (resourceGroupId) {
      var selectedGroup = _.find($scope.resourceGroup.options, function (group) {
        return group.value === resourceGroupId;
      });
      // TODO: deal with the fact that a resourceGroupId is set on the user, but no longer exists?
      if (selectedGroup) {
        $scope.resourceGroup.selected = selectedGroup;
        $scope.resourceGroup.current = selectedGroup;
      }
    };

    var readResourceGroups = function () {
      if (!FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)) {
        return;
      }
      ResourceGroupService.getAllAsOptions().then(function (options) {
        if (options.length > 0) {
          $scope.resourceGroup.options = $scope.resourceGroup.options.concat(options);
          if ($scope.extension.status && $scope.extension.status.resourceGroupId) {
            setSelectedResourceGroup($scope.extension.status.resourceGroupId);
          } else {
            USSService.getUserProps($scope.currentUser.id).then(function (props) {
              if (props.resourceGroups && props.resourceGroups[$scope.extension.id]) {
                setSelectedResourceGroup(props.resourceGroups[$scope.extension.id]);
              }
            });
          }
          $scope.resourceGroup.show = true;
        }
      });
    };

    var updateEntitlement = function (entitled) {
      $scope.savingEntitlements = true;
      var user = [{
        'address': $scope.currentUser.userName
      }];
      var entitlement = [{
        entitlementName: $scope.entitlementNames[$stateParams.extensionId],
        entitlementState: entitled === true ? 'ACTIVE' : 'INACTIVE'
      }];

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
            if (entitled) {
              $stateParams.currentUser.entitlements.push($stateParams.extensionId);
            } else {
              _.remove($stateParams.currentUser.entitlements, function (entitlement) {
                return entitlement === $stateParams.extensionId;
              });
            }
            $scope.setShouldShowButtons();
            $timeout(function () {
              updateStatus();
            }, 2000);
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

        } else {
          entitleResult = {
            msg: $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName
            }),
            type: 'error'
          };
          Notification.notify([entitleResult.msg], entitleResult.type);
        }
        $scope.savingEntitlements = false;
        $scope.saving = $scope.resourceGroup.saving;
      });
    };

    var setResourceGroupOnUser = function (resourceGroupId) {
      $scope.resourceGroup.saving = true;
      var props = { userId: $scope.currentUser.id, resourceGroups: { 'squared-fusion-cal': resourceGroupId } };
      USSService.updateUserProps(props).then(function () {
        $scope.resourceGroup.current = $scope.resourceGroup.selected;
        $scope.setShouldShowButtons();
      }).catch(function () {
        Notification.error('hercules.resourceGroups.failedToSetGroup');
      }).finally(function () {
        $scope.resourceGroup.saving = false;
        $scope.saving = $scope.savingEntitlements;
      });
    };

    updateStatus();
    readResourceGroups();

    $scope.save = function () {
      $scope.savingEntitlements = false;
      $scope.resourceGroup.saving = false;
      $scope.saving = true;
      if (entitlementHasChanged()) {
        updateEntitlement($scope.extension.entitled);
      }
      if ($scope.resourceGroup.hasChanged()) {
        setResourceGroupOnUser($scope.resourceGroup.selected.value);
      }
    };

    $scope.reset = function () {
      $scope.extension.entitled = $scope.currentUser.entitlements.indexOf($stateParams.extensionId) > -1;
      $scope.resourceGroup.reset();
      $scope.showButtons = false;
    };

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };

    $scope.setShouldShowButtons = function () {
      $scope.showButtons = $scope.resourceGroup.hasChanged() || entitlementHasChanged();
    };
  }
}());
