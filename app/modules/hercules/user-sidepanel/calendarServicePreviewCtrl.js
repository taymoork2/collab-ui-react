(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarServicePreviewCtrl', CalendarServicePreviewCtrl);

  /*@ngInject*/
  function CalendarServicePreviewCtrl($scope, $state, $stateParams, Userservice, Notification, USSService, ClusterService, $translate, ResourceGroupService, FeatureToggleService) {
    $scope.entitlementNames = {
      'squared-fusion-cal': 'squaredFusionCal',
      'squared-fusion-uc': 'squaredFusionUC'
    };

    $scope.currentUser = $stateParams.currentUser;
    $scope.isInvitePending = Userservice.isInvitePending($scope.currentUser);
    $scope.localizedServiceName = $translate.instant('hercules.serviceNames.' + $stateParams.extensionId);
    $scope.localizedConnectorName = $translate.instant('hercules.connectorNames.' + $stateParams.extensionId);
    $scope.localizedOnboardingWarning = $translate.instant('hercules.userSidepanel.warningInvitePending', {
      ServiceName: $scope.localizedServiceName
    });
    $scope.resourceGroup = {
      show: false,
      saving: false,
      cannotFindResouceGroup: false,
      init: function () {
        this.options = [{ label: $translate.instant('hercules.resourceGroups.noGroupSelected'), value: '' }];
        this.selected = this.current = this.options[0];
        this.shouldWarn = false;
      },
      reset: function () {
        this.selected = this.current;
        this.saving = false;
        this.displayWarningIfNecessary();
      },
      hasChanged: function () {
        return this.selected !== this.current;
      },
      displayWarningIfNecessary: function () {
        if (_.size(this.options) > 1) {
          ResourceGroupService.resourceGroupHasEligibleCluster($scope.resourceGroup.selected.value, 'c_cal')
            .then(function (hasEligibleCluster) {
              $scope.resourceGroup.shouldWarn = !hasEligibleCluster;
            });
        }
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
      if (newVal !== oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    var entitlementHasChanged = function () {
      return $scope.extension.entitled !== isEntitled();
    };

    var updateStatus = function (userIsRefreshed) {
      if ($scope.isInvitePending) {
        return;
      }
      USSService.getStatusesForUser($scope.currentUser.id).then(function (statuses) {
        $scope.extension.status = _.find(statuses, function (status) {
          return $scope.extension.id === status.serviceId;
        });
        if ($scope.extension.status && $scope.extension.status.connectorId) {
          ClusterService.getConnector($scope.extension.status.connectorId).then(function (connector) {
            $scope.extension.homedConnector = connector;
          });
        }
        // If we find no status in USS and the service is entitled, we try to refresh the user in USS and reload the statuses
        // This can happen if USS has not been notified by CI in a reasonable time after entitled
        if (!$scope.extension.status && isEntitled()) {
          if (userIsRefreshed) {
            // This means we've done a refresh and it didn't help so we give up with a cryptic error message
            $scope.extension.status = { state: 'unknown', entitled: true };
            Notification.error('hercules.userSidepanel.refreshUserDidNoGood');
          } else {
            refreshUserInUss();
          }
        }
      });
    };

    var refreshUserInUss = function () {
      USSService.refreshEntitlementsForUser($scope.currentUser.id).catch(function (response) {
        Notification.errorWithTrackingId(response, 'hercules.userSidepanel.refreshUserFailed');
      }).finally(function () {
        updateStatus(true);
      });
    };

    var setSelectedResourceGroup = function (resourceGroupId) {
      var selectedGroup = _.find($scope.resourceGroup.options, function (group) {
        return group.value === resourceGroupId;
      });
      if (selectedGroup) {
        $scope.resourceGroup.selected = selectedGroup;
        $scope.resourceGroup.current = selectedGroup;
        $scope.resourceGroup.displayWarningIfNecessary();
      } else {
        $scope.resourceGroup.cannotFindResouceGroup = true;
      }
    };

    var readResourceGroups = function () {
      FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)
        .then(function (supported) {
          if (supported) {
            ResourceGroupService.getAllAsOptions().then(function (options) {
              if (options.length > 0) {
                $scope.resourceGroup.options = $scope.resourceGroup.options.concat(options);
                if ($scope.extension.status && $scope.extension.status.resourceGroupId) {
                  setSelectedResourceGroup($scope.extension.status.resourceGroupId);
                } else {
                  USSService.getUserProps($scope.currentUser.id).then(function (props) {
                    if (props.resourceGroups && props.resourceGroups[$scope.extension.id]) {
                      setSelectedResourceGroup(props.resourceGroups[$scope.extension.id]);
                    } else {
                      $scope.resourceGroup.displayWarningIfNecessary();
                    }
                  });
                }
                $scope.resourceGroup.show = true;
              }
            });
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
            if (isEntitled()) {
              // Reset the status which will give the status loader icon
              $scope.extension.status = null;
            }
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
            refreshUserInUss();
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

    $scope.setResourceGroupOnUser = function (resourceGroupId) {
      $scope.resourceGroup.saving = true;
      var props = { userId: $scope.currentUser.id, resourceGroups: { 'squared-fusion-cal': resourceGroupId } };
      USSService.updateUserProps(props).then(function () {
        $scope.resourceGroup.current = $scope.resourceGroup.selected;
        $scope.setShouldShowButtons();
        $scope.resourceGroup.cannotFindResouceGroup = false;
        Notification.success('hercules.resourceGroups.resourceGroupSaved');
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
        $scope.setResourceGroupOnUser($scope.resourceGroup.selected.value);
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

    $scope.selectedResourceGroupChanged = function () {
      $scope.resourceGroup.displayWarningIfNecessary();
      $scope.setShouldShowButtons();
    };

    $scope.setShouldShowButtons = function () {
      if ($scope.resourceGroup.show) {
        if ($scope.resourceGroup.hasChanged()) {
          $scope.showButtons = true;
          return;
        }
      }
      $scope.showButtons = entitlementHasChanged();
    };
  }
}());
