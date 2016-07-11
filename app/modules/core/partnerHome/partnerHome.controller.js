(function () {
  'use strict';

  angular.module('Core')
    .controller('PartnerHomeCtrl', PartnerHomeCtrl);

  /* @ngInject */
  function PartnerHomeCtrl($scope, $timeout, $state, $window, Analytics, Authinfo, Log, Notification, Orgservice, PartnerService, TrialService) {
    $scope.currentDataPosition = 0;

    $scope.daysExpired = 5;
    $scope.displayRows = 10;
    $scope.expiredRows = 3;
    $scope.showTrialsRefresh = true;
    $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
    $scope.isTestOrg = false;

    $scope.launchCustomerPortal = launchCustomerPortal;
    $scope.openAddTrialModal = openAddTrialModal;
    $scope.getProgressStatus = getProgressStatus;
    $scope.getDaysAgo = getDaysAgo;

    init();

    function init() {
      if (!$scope.isCustomerPartner) {
        getTrialsList();
      }

      $scope.activeCount = 0;
      if ($scope.activeList) {
        $scope.activeCount = $scope.activeList.length;
      }

      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          $scope.isTestOrg = data.isTestOrg;
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      });
    }

    function openAddTrialModal() {
      if ($scope.isTestOrg) {
        Analytics.trackEvent('Start Trial Button Click', {
          from: $state.current.name
        });
      }
      $state.go('trialAdd.info').then(function () {
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
        .catch(function (err) {
          Log.debug('Failed to retrieve trial information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });
        })
        .then(function (response) {
          return PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), true);
        })
        .then(function (trialsList) {
          $scope.activeList = _.filter(trialsList, {
            state: "ACTIVE"
          });
          $scope.expiredList = _.filter(trialsList, {
            state: "EXPIRED"
          });
          $scope.showExpired = $scope.expiredList.length > 0;
          Log.debug('active trial records found:' + $scope.activeList.length);
          Log.debug('expiredList trial records found:' + $scope.expiredList.length);
        })
        .finally(function () {
          $scope.showTrialsRefresh = false;
          resizeCards();
        });
    }

    function launchCustomerPortal(trial) {
      $window.open($state.href('login_swap', {
        customerOrgId: trial.customerOrgId,
        customerOrgName: trial.customerName
      }));
    }

    function resizeCards() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }
  }
})();
