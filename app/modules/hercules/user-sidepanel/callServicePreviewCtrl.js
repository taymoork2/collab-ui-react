(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CallServicePreviewCtrl', CallServicePreviewCtrl);

  /*@ngInject*/
  function CallServicePreviewCtrl($scope, $state, $stateParams, Authinfo, Userservice, Notification, USSService, ClusterService, UriVerificationService, DomainManagementService, $translate, FeatureToggleService, ResourceGroupService, UCCService, FusionUtils) {
    $scope.saveLoading = false;
    $scope.domainVerificationError = false;
    $scope.currentUser = $stateParams.currentUser;
    var isEntitled = function (ent) {
      return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf(ent) > -1;
    };
    var isSetup = function (id) {
      var extension = _.find($stateParams.extensions, { id: id });
      return extension ? extension.isSetup : false;
    };

    $scope.isInvitePending = Userservice.isInvitePending($scope.currentUser);
    $scope.localizedServiceName = $translate.instant('hercules.serviceNames.' + $stateParams.extensionId);
    $scope.localizedConnectorName = $translate.instant('hercules.connectorNames.' + $stateParams.extensionId);
    $scope.localizedOnboardingWarning = $translate.instant('hercules.userSidepanel.warningInvitePending', {
      ServiceName: $scope.localizedServiceName
    });

    $scope.callServiceAware = {
      id: 'squared-fusion-uc',
      name: 'squaredFusionUC',
      entitled: isEntitled('squared-fusion-uc'), // Tracks the entitlement as set in the UI (toggle)
      directoryUri: null,
      currentUserEntitled: isEntitled('squared-fusion-uc') // Tracks the actual entitlement on the user
    };
    $scope.callServiceConnect = {
      id: 'squared-fusion-ec',
      name: 'squaredFusionEC',
      entitled: isEntitled('squared-fusion-ec'), // Tracks the entitlement as set in the UI (toggle)
      orgEntitled: Authinfo.isFusionEC(),
      enabledInFMS: false,
      currentUserEntitled: isEntitled('squared-fusion-ec'), // Tracks the actual entitlement on the user
      userId: $scope.currentUser.id,
    };
    $scope.resourceGroup = {
      show: false,
      saving: false,
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
          ResourceGroupService.resourceGroupHasEligibleCluster($scope.resourceGroup.selected.value, 'c_ucmc')
          .then(function (hasEligibleCluster) {
            $scope.resourceGroup.shouldWarn = !hasEligibleCluster;
          });
        }
      }
    };
    $scope.resourceGroup.init();

    // Only show callServiceConnect if it's enabled
    if ($scope.callServiceConnect.orgEntitled) {
      $scope.callServiceConnect.enabledInFMS = isSetup($scope.callServiceConnect.id);
    }

    $scope.$watch('callServiceAware.entitled', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    $scope.$watch('callServiceConnect.entitled', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    var entitlementHasChanged = function () {
      return $scope.callServiceConnect.entitled !== isEntitled($scope.callServiceConnect.id) || $scope.callServiceAware.entitled !== isEntitled($scope.callServiceAware.id);
    };

    var resetStatusesIfEntitlementChanged = function () {
      if ($scope.callServiceConnect.entitled !== isEntitled($scope.callServiceConnect.id)) {
        $scope.callServiceConnect.status = null;
      }
      if ($scope.callServiceAware.entitled !== isEntitled($scope.callServiceAware.id)) {
        $scope.callServiceAware.status = null;
      }
    };

    var updateStatus = function (userIsRefreshed) {
      if ($scope.isInvitePending) {
        return;
      }
      $scope.updatingStatus = true;
      USSService.getStatusesForUser($scope.currentUser.id).then(function (statuses) {
        $scope.callServiceAware.status = _.find(statuses, function (status) {
          return $scope.callServiceAware.id === status.serviceId;
        });
        refreshUserInUssIfServiceEntitledButNoStatus($scope.callServiceAware, userIsRefreshed);
        $scope.callServiceConnect.status = _.find(statuses, function (status) {
          return $scope.callServiceConnect.id === status.serviceId;
        });
        refreshUserInUssIfServiceEntitledButNoStatus($scope.callServiceConnect, userIsRefreshed);
        if ($scope.callServiceAware.status && $scope.callServiceAware.status.connectorId) {
          ClusterService.getConnector($scope.callServiceAware.status.connectorId).then(function (connector) {
            $scope.callServiceAware.homedConnector = connector;
          });
        }
        if ($scope.callServiceAware.status && $scope.callServiceAware.status.lastStateChange) {
          $scope.callServiceAware.status.lastStateChangeText = FusionUtils.getTimeSinceText($scope.callServiceAware.status.lastStateChange);
        }
        if ($scope.callServiceConnect.status && $scope.callServiceConnect.status.connectorId) {
          ClusterService.getConnector($scope.callServiceConnect.status.connectorId).then(function (connector) {
            $scope.callServiceConnect.homedConnector = connector;
          });
        }
        if ($scope.callServiceConnect.status && $scope.callServiceConnect.status.lastStateChange) {
          $scope.callServiceConnect.status.lastStateChangeText = FusionUtils.getTimeSinceText($scope.callServiceConnect.status.lastStateChange);
        }
        if ($scope.callServiceAware.entitled && $scope.callServiceAware.status) {
          UCCService.getUserDiscovery($scope.currentUser.id).then(function (userDiscovery) {
            $scope.callServiceAware.directoryUri = userDiscovery.directoryURI;
            if ($scope.callServiceAware.directoryUri) {
              DomainManagementService.getVerifiedDomains().then(function (domainList) {
                if (!UriVerificationService.isDomainVerified(domainList, $scope.callServiceAware.directoryUri)) {
                  $scope.domainVerificationError = true;
                }
              });
            } else {
              $scope.domainVerificationError = false;
            }
          });
        }
      }).catch(function (response) {
        Notification.errorWithTrackingId(response, 'hercules.userSidepanel.readUserStatusFailed');
      }).finally(function () {
        $scope.updatingStatus = false;
      });
    };

    var refreshUserInUss = function () {
      if ($scope.isInvitePending) {
        return;
      }
      USSService.refreshEntitlementsForUser($scope.currentUser.id).catch(function (response) {
        Notification.errorWithTrackingId(response, 'hercules.userSidepanel.refreshUserFailed');
      }).finally(function () {
        updateStatus(true);
      });
    };

    var refreshUserInUssIfServiceEntitledButNoStatus = function (service, secondPass) {
      // If we find no status in USS and the service is entitled, we try to refresh the user in USS and reload the statuses
      // This can happen if USS has not been notified by CI in a reasonable time after entitled
      if (!service.status && isEntitled(service.id)) {
        if (secondPass) {
          // This means we've done a refresh and it didn't help so we give up with a cryptic error message
          service.status = { state: 'unknown', entitled: true };
          Notification.error('hercules.userSidepanel.refreshUserDidNoGood');
        } else {
          refreshUserInUss();
        }
      }
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
      FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroup)
        .then(function (supported) {
          if (supported) {
            ResourceGroupService.getAllAsOptions().then(function (options) {
              if (options.length > 0) {
                $scope.resourceGroup.options = $scope.resourceGroup.options.concat(options);
                if ($scope.callServiceAware.status && $scope.callServiceAware.status.resourceGroupId) {
                  setSelectedResourceGroup($scope.callServiceAware.status.resourceGroupId);
                } else {
                  USSService.getUserProps($scope.currentUser.id).then(function (props) {
                    if (props.resourceGroups && props.resourceGroups[$scope.callServiceAware.id]) {
                      setSelectedResourceGroup(props.resourceGroups[$scope.callServiceAware.id]);
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

    updateStatus();
    readResourceGroups();

    var addEntitlementToCurrentUser = function (entitlement) {
      if (!_.includes($stateParams.currentUser.entitlements, entitlement)) {
        $stateParams.currentUser.entitlements.push(entitlement);
      }
      $scope.callServiceAware.currentUserEntitled = isEntitled($scope.callServiceAware.id);
      $scope.callServiceConnect.currentUserEntitled = isEntitled($scope.callServiceConnect.id);
    };

    var removeEntitlementFromCurrentUser = function (entitlement) {
      _.remove($stateParams.currentUser.entitlements, function (e) {
        return e === entitlement;
      });
      $scope.callServiceAware.currentUserEntitled = isEntitled($scope.callServiceAware.id);
      $scope.callServiceConnect.currentUserEntitled = isEntitled($scope.callServiceConnect.id);
    };

    var updateEntitlements = function () {
      $scope.savingEntitlements = true;
      $scope.savingAwareEntitlement = $scope.callServiceAware.currentUserEntitled !== $scope.callServiceAware.entitled;
      $scope.savingConnectEntitlement = $scope.callServiceConnect.currentUserEntitled !== $scope.callServiceConnect.entitled;
      var user = [{
        'address': $scope.currentUser.userName
      }];
      var entitlements = [{
        entitlementName: $scope.callServiceAware.name,
        entitlementState: $scope.callServiceAware.entitled === true ? 'ACTIVE' : 'INACTIVE'
      }];
      if ($scope.callServiceConnect.orgEntitled && $scope.callServiceConnect.enabledInFMS) {
        entitlements.push({
          entitlementName: $scope.callServiceConnect.name,
          entitlementState: $scope.callServiceAware.entitled === true && $scope.callServiceConnect.entitled === true ? 'ACTIVE' : 'INACTIVE'
        });
      }

      Userservice.updateUsers(user, null, entitlements, 'updateEntitlement', function (data) {
        var entitleResult = {
          msg: null,
          type: 'null'
        };
        if (data.success) {
          var userStatus = data.userResponse[0].status;
          if (userStatus === 200) {
            resetStatusesIfEntitlementChanged();
            if (!$stateParams.currentUser.entitlements) {
              $stateParams.currentUser.entitlements = [];
            }
            if ($scope.callServiceAware.entitled) {
              addEntitlementToCurrentUser($scope.callServiceAware.id);
            } else {
              removeEntitlementFromCurrentUser($scope.callServiceAware.id);
              $scope.callServiceConnect.entitled = false;
            }
            if ($scope.callServiceConnect.orgEntitled && $scope.callServiceConnect.enabledInFMS) {
              if ($scope.callServiceConnect.entitled) {
                addEntitlementToCurrentUser($scope.callServiceConnect.id);
              } else {
                removeEntitlementFromCurrentUser($scope.callServiceConnect.id);
              }
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
        $scope.savingEntitlements = $scope.savingAwareEntitlement = $scope.savingConnectEntitlement = false;
        $scope.saving = $scope.resourceGroup.saving;
      });
    };

    $scope.setResourceGroupOnUser = function (resourceGroupId) {
      $scope.resourceGroup.saving = true;
      var props = { userId: $scope.currentUser.id, resourceGroups: { 'squared-fusion-uc': resourceGroupId } };
      USSService.updateUserProps(props).then(function () {
        $scope.resourceGroup.current = $scope.resourceGroup.selected;
        $scope.setShouldShowButtons();
        $scope.resourceGroup.cannotFindResouceGroup = false;
        Notification.success('hercules.resourceGroups.resourceGroupSaved');
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'hercules.resourceGroups.failedToSetGroup');
      }).finally(function () {
        $scope.resourceGroup.saving = false;
        $scope.saving = $scope.savingEntitlements;
      });
    };

    $scope.save = function () {
      $scope.savingEntitlements = false;
      $scope.resourceGroup.saving = false;
      $scope.saving = true;
      if (entitlementHasChanged()) {
        updateEntitlements();
      }
      if ($scope.resourceGroup.hasChanged()) {
        $scope.setResourceGroupOnUser($scope.resourceGroup.selected.value);
      }
    };

    $scope.reset = function () {
      $scope.callServiceAware.entitled = isEntitled($scope.callServiceAware.id);
      $scope.callServiceConnect.entitled = isEntitled($scope.callServiceConnect.id);
      $scope.resourceGroup.reset();
      $scope.showButtons = false;
    };

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };

    $scope.navigateToCallSettings = function () {
      $state.go('call-service.settings');
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
