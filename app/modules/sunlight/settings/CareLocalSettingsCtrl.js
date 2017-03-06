(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareLocalSettingsCtrl', CareLocalSettingsCtrl);

  /* @ngInject */
  function CareLocalSettingsCtrl($interval, $scope, $translate, Authinfo, Log, Notification, SunlightConfigService) {
    var vm = this;

    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.ONBOARD_STATUS_UNKNOWN = 'Unknown';
    vm.ONBOARD_STATUS_PENDING = 'Pending';
    vm.ONBOARD_STATUS_SUCCESS = 'Success';
    vm.ONBOARD_STATUS_FAILURE = 'Failure';
    vm.csOnboardingStatus = vm.ONBOARD_STATUS_UNKNOWN;
    vm.aaOnboardingStatus = vm.ONBOARD_STATUS_UNKNOWN;

    vm.state = vm.ONBOARDED;
    vm.errorCount = 0;

    vm.onboardToCare = function () {
      if (vm.csOnboardingStatus !== vm.ONBOARD_STATUS_SUCCESS) {
        SunlightConfigService.onBoardCare();
      }
      if (Authinfo.isCareVoice() && vm.aaOnboardingStatus !== vm.ONBOARD_STATUS_SUCCESS) {
        SunlightConfigService.aaOnboard();
      }
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
        var onboardingStatus = getOnboardingStatus(result);
        switch (onboardingStatus) {
          case vm.ONBOARD_STATUS_SUCCESS:
            Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
            vm.state = vm.ONBOARDED;
            stopPolling();
            break;
          case vm.ONBOARD_STATUS_FAILURE:
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
              vm.state = vm.NOT_ONBOARDED;
              Notification.errorWithTrackingId(result, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
              stopPolling();
            }
          }
        });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.state = vm.NOT_ONBOARDED;
      Notification.error($translate.instant('sunlightDetails.settings.setUpCareFailure'));
    }

    function getOnboardingStatus(result) {
      vm.csOnboardingStatus = _.get(result, 'data.csOnboardingStatus');
      vm.aaOnboardingStatus = _.get(result, 'data.aaOnboardingStatus');
      var onboardingStatus = vm.csOnboardingStatus;
      if (Authinfo.isCareVoice()) {
        // to give priority to pending status
        if (vm.aaOnboardingStatus == vm.ONBOARD_STATUS_PENDING) {
          onboardingStatus = vm.ONBOARD_STATUS_PENDING;
        } else if (onboardingStatus === vm.ONBOARD_STATUS_SUCCESS) {
          onboardingStatus = vm.aaOnboardingStatus;
        }
      }
      return onboardingStatus;
    }

    function init() {
      SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = getOnboardingStatus(result);
        switch (onboardingStatus) {
          case vm.ONBOARD_STATUS_PENDING:
            vm.state = vm.IN_PROGRESS;
            startPolling();
            break;
          case vm.ONBOARD_STATUS_SUCCESS:
            vm.state = vm.ONBOARDED;
            break;
          default:
            vm.state = vm.NOT_ONBOARDED;
        }
        if (result.data.orgName === "" || !(_.get(result, 'data.orgName'))) {
          result.data.orgName = Authinfo.getOrgName();
          SunlightConfigService.updateChatConfig(result.data).then(function (result) {
            Log.debug('Successfully updated org config with org name', result);
          });
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
