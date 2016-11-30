(function () {
  'use strict';

  angular.module('Core')
    .controller('CareSettingsCtrl', CareSettingsCtrl);

  function CareSettingsCtrl($interval, $scope, $translate, Log, Notification, SunlightConfigService) {
    var vm = this;

    vm.UNKNOWN = 'unknown';
    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.state = vm.UNKNOWN;
    vm.errorCount = 0;

    vm.onboardToCs = function () {
      SunlightConfigService.onBoardCare();
      vm.state = vm.IN_PROGRESS;
      startPolling();
    };

    var poller;
    var pollInterval = 10000;
    var pollRetryCount = 30;
    var pollErrorCount = 3;
    $scope.$on('$destroy', function () {
      $interval.cancel(poller);
      poller = undefined;
    });

    function startPolling() {
      if (!_.isUndefined(poller)) return;

      vm.errorCount = 0;
      poller = $interval(processOnboardStatus, pollInterval, pollRetryCount);
      poller.then(processTimeout);
    }

    function stopPolling() {
      if (!_.isUndefined(poller)) {
        $interval.cancel(poller);
        poller = undefined;
      }
    }

    function processOnboardStatus() {
      SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = _.get(result, 'data.csOnboardingStatus');
        switch (onboardingStatus) {
          case 'Success':
            Notification.success($translate.instant('firstTimeWizard.careSettingsComplete'));
            vm.state = vm.ONBOARDED;
            stopPolling();
            enableNext();
            break;
          case 'Failure':
            Notification.errorWithTrackingId(result, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
            vm.state = vm.NOT_ONBOARDED;
            stopPolling();
            break;
          default:
            Log.debug('Care setup status is not Success: ', result);
        }
      })
      .catch(function (result) {
        if (result.status !== 404) {
          Log.debug('Fetching Care setup status failed: ', result);
          if (vm.errorCount++ >= pollErrorCount) {
            vm.state = vm.UNKNOWN;
            Notification.errorWithTrackingId(result, 'firstTimeWizard.careSettingsFetchFailed');
            stopPolling();
          }
        }
      });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.state = vm.NOT_ONBOARDED;
      Notification.error('firstTimeWizard.careSettingsTimeout');
    }

    function enableNext() {
      _.set($scope.wizard, 'isNextDisabled', false);
    }

    function disableNext() {
      _.set($scope.wizard, 'isNextDisabled', true);
    }

    function init() {
      disableNext();

      SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = _.get(result, 'data.csOnboardingStatus');
        switch (onboardingStatus) {
          case 'Pending':
            vm.state = vm.IN_PROGRESS;
            startPolling();
            break;
          case 'Success':
            vm.state = vm.ONBOARDED;
            enableNext();
            break;
          default:
            vm.state = vm.NOT_ONBOARDED;
        }
      })
      .catch(function (result) {
        if (result.status === 404) {
          vm.state = vm.NOT_ONBOARDED;
        } else {
          Log.debug('Fetching Care setup status, on load, failed: ', result);
        }
      });
    }

    init();
  }
})();
