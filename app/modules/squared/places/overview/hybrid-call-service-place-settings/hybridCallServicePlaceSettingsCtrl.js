(function () {
  'use strict';

  module.exports = HybridCallServicePlaceSettingsCtrl;

  /*@ngInject*/
  function HybridCallServicePlaceSettingsCtrl($scope, $stateParams, Notification, USSService, HybridServicesClusterService, HybridServiceUserSidepanelHelperService, UriVerificationService, DomainManagementService, $translate, UCCService, HybridServicesI18NService) {
    $scope.saveLoading = false;
    $scope.domainVerificationError = false;
    $scope.currentPlace = $stateParams.getCurrentPlace();

    var isEntitled = function (ent) {
      return $scope.currentPlace.entitlements && $scope.currentPlace.entitlements.indexOf(ent) > -1;
    };

    $scope.callServiceAware = {
      id: 'squared-fusion-uc',
      name: 'squaredFusionUC',
      entitled: isEntitled('squared-fusion-uc'), // Tracks the entitlement as set in the UI (toggle)
      directoryUri: null,
      currentPlaceEntitled: isEntitled('squared-fusion-uc'), // Tracks the actual entitlement on the user
    };

    if ($scope.currentPlace.externalLinkedAccounts) {
      var existingHybridCallLink = _.head(_.filter($scope.currentPlace.externalLinkedAccounts, function (linkedAccount) {
        return linkedAccount && (linkedAccount.providerID === 'squared-fusion-uc');
      }));
      if (existingHybridCallLink) {
        $scope.mailID = existingHybridCallLink.accountGUID;
      }
    }

    var updateStatus = function (userIsRefreshed) {
      $scope.updatingStatus = true;
      USSService.getStatusesForUser($scope.currentPlace.id).then(function (statuses) {
        $scope.callServiceAware.status = _.find(statuses, function (status) {
          return $scope.callServiceAware.id === status.serviceId;
        });
        refreshUserInUssIfServiceEntitledButNoStatus($scope.callServiceAware, userIsRefreshed);
        if ($scope.callServiceAware.status && $scope.callServiceAware.status.clusterId) {
          HybridServicesClusterService.get($scope.callServiceAware.status.clusterId).then(function (cluster) {
            $scope.callServiceAware.homedCluster = cluster;
            $scope.callServiceAware.homedConnector = _.find(cluster.connectors, { id: $scope.callServiceAware.status.connectorId });
          });
        }
        if ($scope.callServiceAware.status && $scope.callServiceAware.status.lastStateChange) {
          $scope.callServiceAware.status.lastStateChangeText = HybridServicesI18NService.getTimeSinceText($scope.callServiceAware.status.lastStateChange);
        }
        if ($scope.callServiceAware.entitled && $scope.callServiceAware.status) {
          UCCService.getUserDiscovery($scope.currentPlace.id).then(function (userDiscovery) {
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
            if (userDiscovery.primaryDn && userDiscovery.telephoneNumber && userDiscovery.primaryDn !== userDiscovery.telephoneNumber) {
              $scope.directoryNumbers = userDiscovery.primaryDn + ' ' + $translate.instant('common.or') + ' ' + userDiscovery.telephoneNumber;
            } else if (userDiscovery.primaryDn) {
              $scope.directoryNumbers = userDiscovery.primaryDn;
            } else if (userDiscovery.telephoneNumber) {
              $scope.directoryNumbers = userDiscovery.telephoneNumber;
            }
          });
        }
      }).catch(function (error) {
        if (HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadDeviceDataFromUSSPartnerAdmin',
            feedbackInstructions: true,
          });
        } else {
          Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadDeviceDataFromUSS');
        }
      }).finally(function () {
        $scope.updatingStatus = false;
      });
    };

    var refreshUserInUss = function () {
      USSService.refreshEntitlementsForUser($scope.currentPlace.id).catch(function (response) {
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

    updateStatus();

    $scope.editCloudberryServices = function (service) {
      $stateParams.editService(service);
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };
  }
}());
