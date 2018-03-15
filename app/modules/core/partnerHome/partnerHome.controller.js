require('./_partner-home.scss');
require('./_partner-landing-trials.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('PartnerHomeCtrl', PartnerHomeCtrl);

  /* @ngInject */
  function PartnerHomeCtrl($scope, $state, $window, $translate, Analytics, Authinfo, CardUtils, Log, Notification, Orgservice, PartnerService, TrialService, FeatureToggleService) {
    $scope.currentDataPosition = 0;

    $scope.daysExpired = 5;
    $scope.displayRows = 10;
    $scope.expiredRows = 3;
    $scope.showTrialsRefresh = true;
    $scope.isCustomerPartner = !!Authinfo.isCustomerPartner;
    $scope.isTestOrg = false;

    $scope.launchCustomerPortal = launchCustomerPortal;
    $scope.openAddTrialModal = openAddTrialModal;
    $scope.getProgressStatus = getProgressStatus;
    $scope.getDaysAgo = getDaysAgo;
    $scope.ariaTrialLabel = ariaTrialLabel;
    $scope.ariaExpLabel = ariaExpLabel;
    $scope.notifications = [];
    $scope.hcsFeatureToggle = false;
    $scope.cardSize = 'cs-card--large';

    init();

    function init() {
      if (!$scope.isCustomerPartner) {
        getTrialsList();
      }

      FeatureToggleService.supports(FeatureToggleService.features.atlasHostedCloudService).then(function (result) {
        $scope.hcsFeatureToggle = result;
        if ($scope.hcsFeatureToggle) {
          $scope.cardSize = 'cs-card--medium';
        }
        CardUtils.resize();
      });

      $scope.activeCount = 0;
      if ($scope.activeList) {
        $scope.activeCount = $scope.activeList.length;
      }

      Orgservice.isTestOrg()
        .then(function (isTestOrg) {
          $scope.isTestOrg = isTestOrg;
        });
    }

    function ariaTrialLabel(trial) {
      var label = trial.customerName + ', ' +
        $translate.instant('partnerHomePage.aria.daysLeft', { count: trial.daysLeft }, 'messageformat') + ', ' +
        $translate.instant('partnerHomePage.aria.userTotals', { users: trial.usage, licenses: trial.licenses });
      return label;
    }

    function ariaExpLabel(trial) {
      var label = trial.customerName + ', ' +
        $translate.instant('partnerHomePage.aria.daysSinceExp', { count: getDaysAgo(trial.daysLeft) }, 'messageformat') + ', ' +
        $translate.instant('partnerHomePage.aria.userTotals', { users: trial.usage, licenses: trial.licenses });
      return label;
    }

    function openAddTrialModal() {
      Analytics.trackTrialSteps(Analytics.sections.TRIAL.eventNames.START_SETUP);

      var route = TrialService.getAddTrialRoute();
      $state.go(route.path, route.params).then(function () {
        $state.modal.result.finally(getTrialsList);
      });
    }

    function getProgressStatus(obj) {
      if (obj.daysLeft <= 5) {
        return 'danger';
      } else if (obj.daysLeft < (obj.duration / 2)) {
        return 'warning';
      } else {
        return 'success';
      }
    }

    function getDaysAgo(daysLeft) {
      return Math.abs(daysLeft);
    }

    function getTrialsList() {
      $scope.showTrialsRefresh = true;
      TrialService.getTrialsList()
        .catch(function (response) {
          Notification.errorResponse(response, 'partnerHomePage.errGetTrialsQuery');
        })
        .then(function (response) {
          return PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), { isTrialData: true });
        })
        .then(function (trialsList) {
          $scope.activeList = _.filter(trialsList, {
            state: 'ACTIVE',
          });
          $scope.expiredList = _.filter(trialsList, {
            state: 'EXPIRED',
          });
          $scope.showExpired = $scope.expiredList.length > 0;
          Log.debug('active trial records found:' + $scope.activeList.length);
          Log.debug('expiredList trial records found:' + $scope.expiredList.length);
        })
        .finally(function () {
          $scope.showTrialsRefresh = false;
          CardUtils.resize();
        });
    }

    function launchCustomerPortal(trial) {
      $window.open($state.href('login', {
        customerOrgId: trial.customerOrgId,
      }));
    }
  }
})();
