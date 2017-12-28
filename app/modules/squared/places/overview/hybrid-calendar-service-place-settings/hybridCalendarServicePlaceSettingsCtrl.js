(function () {
  'use strict';

  module.exports = HybridCalendarServicePlaceSettingsCtrl;

  /*@ngInject*/
  function HybridCalendarServicePlaceSettingsCtrl($scope, $state, $stateParams, Notification, USSService, $translate, HybridServicesI18NService) {
    $scope.currentPlace = $stateParams.getCurrentPlace();
    $scope.currentStateName = $state.current.name;
    $scope.serviceId = $stateParams.extensionId;

    if ($scope.serviceId === 'squared-fusion-cal') {
      $scope.calendarType = $translate.instant('hercules.cloudExtensions.exchange');
    } else if ($scope.serviceId === 'squared-fusion-gcal') {
      $scope.calendarType = $translate.instant('hercules.cloudExtensions.google');
    }

    if ($scope.currentPlace.externalLinkedAccounts) {
      var existingHybridCallLink = _.head(_.filter($scope.currentPlace.externalLinkedAccounts, function (linkedAccount) {
        return linkedAccount && (linkedAccount.providerID === $scope.serviceId);
      }));
      if (existingHybridCallLink) {
        $scope.emailOfMailbox = existingHybridCallLink.accountGUID;
      }
    }

    var readPlaceInUSS = function (placeIsRefreshed) {
      USSService.getStatusesForUser($scope.currentPlace.id).then(function (statuses) {
        $scope.placeStatusInUSS = _.find(statuses, function (status) {
          return $scope.serviceId === status.serviceId;
        });
        if ($scope.placeStatusInUSS && $scope.placeStatusInUSS.lastStateChange) {
          $scope.placeStatusInUSS.lastStateChangeText = HybridServicesI18NService.getTimeSinceText($scope.placeStatusInUSS.lastStateChange);
        }

        // If we find no status in USS and the service is entitled, we try to refresh the place in USS and reload the statuses
        // This can happen if USS has not been notified by CI in a reasonable time after entitled
        if (!$scope.placeStatusInUSS) {
          if (placeIsRefreshed) {
            // This means we've done a refresh and it didn't help so we give up with a cryptic error message
            $scope.placeStatusInUSS = { state: 'unknown', entitled: true };
            Notification.error('hercules.userSidepanel.refreshUserDidNoGood');
          } else {
            refreshPlaceInUss();
          }
        }
      });
    };

    var refreshPlaceInUss = function () {
      USSService.refreshEntitlementsForUser($scope.currentPlace.id).catch(function (response) {
        Notification.errorWithTrackingId(response, 'hercules.userSidepanel.refreshUserFailed');
      }).finally(function () {
        readPlaceInUSS(true);
      });
    };

    readPlaceInUSS();

    $scope.editCloudberryServices = function (service) {
      $stateParams.editService(service);
    };

    $scope.getStatus = function (status) {
      return USSService.decorateWithStatus(status);
    };
  }
}());
