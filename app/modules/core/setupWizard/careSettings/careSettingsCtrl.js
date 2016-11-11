(function () {
  'use strict';

  angular.module('Core')
    .controller('CareSettingsCtrl', CareSettingsCtrl);

  function CareSettingsCtrl($interval, $scope, $translate, $window, Authinfo, Log, Notification, SunlightConfigService, TokenService, UrlConfig) {
    var vm = this;
    var callbackUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/csonboard?accessToken='
      + TokenService.getAccessToken() + '&orgName=' + Authinfo.getOrgName();
    var ccfsUrl = UrlConfig.getCcfsUrl() + encodeURIComponent(callbackUrl);

    vm.UNKNOWN = 'unknown';
    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.state = vm.UNKNOWN;
    vm.errorCount = 0;

    vm.onboardToCs = function () {
      $window.open(ccfsUrl, '_blank');
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
      enableNext();
    }

    function processOnboardStatus() {
      SunlightConfigService.getChatConfig().then(function (result) {
        if (_.get(result, 'data.csConnString')) {
          Notification.success($translate.instant('firstTimeWizard.careSettingsComplete'));
          vm.state = vm.ONBOARDED;
          stopPolling();
        } else {
          Log.debug('Chat Config does not have CS connection string: ', result);
        }
      })
      .catch(function (result) {
        if (result.status !== 404) {
          Log.debug('Fetching Care setup status failed: ', result);
          if (vm.errorCount++ >= pollErrorCount) {
            vm.state = vm.UNKNOWN;
            Notification.error('firstTimeWizard.careSettingsFetchFailed');
            stopPolling();
          }
        }
      });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.state = vm.NOT_ONBOARDED;
      Notification.error('firstTimeWizard.careSettingsTimeout');
      enableNext();
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
        if (_.get(result, 'data.csConnString')) {
          vm.state = vm.ONBOARDED;
          enableNext();
        }
      })
      .catch(function (result) {
        if (result.status === 404) {
          vm.state = vm.NOT_ONBOARDED;
        } else {
          Log.debug('Fetching Care setup status, on load, failed: ', result);
          enableNext();
        }
      });
    }

    init();
  }
})();
