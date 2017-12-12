(function () {
  'use strict';

  module.exports = HybridCalendarServicePlaceSettingsCtrl;

  /*@ngInject*/
  function HybridCalendarServicePlaceSettingsCtrl($scope, $state, $stateParams, Authinfo, Userservice, Orgservice, Notification, USSService, $translate, ResourceGroupService, FeatureToggleService, HybridServicesI18NService) {
    $scope.entitlementNames = {
      'squared-fusion-cal': 'squaredFusionCal',
      'squared-fusion-gcal': 'squaredFusionGCal',
    };

    $scope.currentUser = $stateParams.currentUser || $stateParams.getCurrentPlace();
    $scope.isPlace = $scope.currentUser.accountType === 'MACHINE';
    $scope.isUser = !$scope.isPlace;
    $scope.currentStateName = $state.current.name;
    $scope.isInvitePending = $scope.isUser && Userservice.isInvitePending($scope.currentUser);
    $scope.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-cal');
    $scope.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-cal');
    $scope.localizedOnboardingWarning = $translate.instant('hercules.userSidepanel.warningInvitePending', {
      ServiceName: $scope.localizedServiceName,
    });
    $scope.extension = {
      id: $stateParams.extensionId,
      entitled: $scope.currentUser.entitlements && $scope.currentUser.entitlements.indexOf($stateParams.extensionId) > -1, // Tracks the entitlement as set in the UI (toggle)
      hasShowPreferredWebExSiteNameFeatureToggle: false,
      preferredWebExSiteName: $translate.instant('hercules.cloudExtensions.preferredWebExSiteDefault'),
      currentUserEntitled: $scope.currentUser.entitlements && $scope.currentUser.entitlements.indexOf($stateParams.extensionId) > -1, // Tracks the actual entitlement on the user
      isExchange: function () {
        return this.id === 'squared-fusion-cal';
      },
    };
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
      },
      updateShow: function () {
        this.show = $scope.extension.isExchange() && _.size(this.options) > 1;
      },
    };
    $scope.resourceGroup.init();

    var isEntitled = function () {
      return $scope.currentUser.entitlements && $scope.currentUser.entitlements.indexOf($scope.extension.id) > -1;
    };

    var isSetup = function (id) {
      var extension = _.find($stateParams.extensions, { id: id });
      return extension ? extension.isSetup : false;
    };

    $scope.calendarType = {
      exchangeName: $translate.instant('hercules.cloudExtensions.exchange'),
      exchangeSetup: isSetup('squared-fusion-cal'),
      googleName: $translate.instant('hercules.cloudExtensions.google'),
      googleSetup: isSetup('squared-fusion-gcal'),
      notSetupText: $translate.instant('hercules.cloudExtensions.notSetup'),
      init: function () {
        this.selected = $scope.extension.id;
        this.exchangeEnabled = this.exchangeSetup && !isEntitled();
        this.googleEnabled = this.googleSetup && !isEntitled();
      },
    };
    $scope.calendarType.init();

    FeatureToggleService.calsvcShowPreferredSiteNameGetStatus().then(function (toggle) {
      $scope.extension.hasShowPreferredWebExSiteNameFeatureToggle = toggle;
      if (toggle) {
        $scope.extension.preferredWebExSiteName = Userservice.getPreferredWebExSiteForCalendaring($scope.currentUser);
        if (!$scope.extension.preferredWebExSiteName) {
          // Read org settings preference...
          var params = {
            basicInfo: true,
            disableCache: true,
          };
          Orgservice.getOrg(_.noop, Authinfo.getOrgId(), params)
            .then(function (response) {
              if (_.get(response, 'data.orgSettings.calSvcpreferredWebExSite')) {
                $scope.extension.preferredWebExSiteName = response.data.orgSettings.calSvcDefaultWebExSite;
              }
            });
        }
      }
    });

    $scope.$watch('extension.entitled', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    var entitlementHasChanged = function () {
      return $scope.extension.entitled !== isEntitled();
    };

    if ($scope.isPlace && $scope.currentUser.externalLinkedAccounts) {
      var existingHybridCallLink = _.head(_.filter($scope.currentUser.externalLinkedAccounts, function (linkedAccount) {
        return linkedAccount && (linkedAccount.providerID === $scope.extension.id);
      }));
      if (existingHybridCallLink) {
        $scope.emailOfMailbox = existingHybridCallLink.accountGUID;
      }
    }

    var updateStatus = function (userIsRefreshed) {
      if ($scope.isInvitePending) {
        return;
      }
      USSService.getStatusesForUser($scope.currentUser.id).then(function (statuses) {
        $scope.extension.status = _.find(statuses, function (status) {
          return $scope.extension.id === status.serviceId;
        });
        if ($scope.extension.status && $scope.extension.status.lastStateChange) {
          $scope.extension.status.lastStateChangeText = HybridServicesI18NService.getTimeSinceText($scope.extension.status.lastStateChange);
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
      if ($scope.isInvitePending) {
        return;
      }
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
      ResourceGroupService.getAllAsOptions().then(function (options) {
        if (options.length > 0) {
          options = options.sort(function (a, b) {
            return a.label.localeCompare(b.label);
          });
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
          $scope.resourceGroup.updateShow();
        }
      });
    };

    var updateEntitlement = function (entitled) {
      $scope.savingEntitlements = true;
      var user = [{
        address: $scope.currentUser.userName,
      }];
      var entitlement = [{
        entitlementName: $scope.entitlementNames[$scope.extension.id],
        entitlementState: entitled === true ? 'ACTIVE' : 'INACTIVE',
      }];

      Userservice.updateUsers(user, null, entitlement, 'updateEntitlement', function (data) {
        var entitleResult = {
          msg: null,
          type: 'null',
        };
        if (data.success) {
          var userStatus = data.userResponse[0].status;
          if (userStatus === 200) {
            if (isEntitled()) {
              // Reset the status which will give the status loader icon
              $scope.extension.status = null;
            }
            if (!$scope.currentUser.entitlements) {
              $scope.currentUser.entitlements = [];
            }
            if (entitled) {
              $scope.currentUser.entitlements.push($scope.extension.id);
            } else {
              _.remove($scope.currentUser.entitlements, function (entitlement) {
                return entitlement === $scope.extension.id;
              });
            }
            $scope.extension.currentUserEntitled = isEntitled();
            $scope.calendarType.init();
            $scope.setShouldShowButtons();
            refreshUserInUss();
          } else if (userStatus === 404) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.entitlements-dont-exist', {
              userName: $scope.currentUser.userName,
            });
            entitleResult.type = 'error';
          } else if (userStatus === 409) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.previously-updated');
            entitleResult.type = 'error';
          } else {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName,
            });
            entitleResult.type = 'error';
          }
          if (userStatus !== 200) {
            Notification.notify([entitleResult.msg], entitleResult.type);
          }
        } else {
          entitleResult = {
            msg: $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName,
            }),
            type: 'error',
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
      USSService.updateBulkUserProps([props]).then(function () {
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
      $scope.extension.entitled = $scope.currentUser.entitlements.indexOf($scope.extension.id) > -1;
      $scope.resourceGroup.reset();
      $scope.showButtons = false;
    };

    $scope.editCloudberryServices = function (service) {
      $stateParams.editService(service);
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

    $scope.selectedCalendarTypeChanged = function (type) {
      $scope.extension.id = type;
      $scope.resourceGroup.updateShow();
      $scope.calendarType.init();
    };
  }
}());
