(function () {
  'use strict';

  angular.module('Core')
    .controller('CareSettingsCtrl', CareSettingsCtrl);

  function CareSettingsCtrl($http, $interval, $scope, $translate, $window, Authinfo, Log, Notification, TokenService, UrlConfig) {
    var vm = this;
    var callbackUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/csonboard?accessToken='
      + TokenService.getAccessToken();
    var ccfsUrl = UrlConfig.getCcfsUrl() + callbackUrl;
    var statusUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';

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
      _.set($scope.wizard, 'isNextDisabled', false);
    }

    function processOnboardStatus() {
      getStatus().then(function (result) {
        if (_.get(result, 'data.csConnString')) {
          if (vm.state === vm.IN_PROGRESS) {
            Notification.success($translate.instant('firstTimeWizard.careSettingsComplete'));
          }
          vm.state = vm.ONBOARDED;
          stopPolling();
        } else {
          Log.debug('Bad response for GET Chat Config: ', result);
        }
      })
      .catch(function (result) {
        if (result.status === 404) {
          if (vm.state === vm.UNKNOWN) {
            vm.state = vm.NOT_ONBOARDED;
          }
        } else {
          Log.debug('Fetching Care setup status failed: ', result);
          if (vm.state === vm.UNKNOWN || vm.errorCount++ >= pollErrorCount) {
            vm.state = vm.UNKNOWN;
            Notification.error($translate.instant('firstTimeWizard.careSettingsFetchFailed'));
            stopPolling();
          }
        }
      });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.state = vm.NOT_ONBOARDED;
      Notification.error($translate.instant('firstTimeWizard.careSettingsTimeout'));
    }

    function getStatus() {
      var config = {
        headers: {
          'Authorization': 'Bearer ' + TokenService.getAccessToken()
        }
      };
      return $http.get(statusUrl, config);
    }

    function init() {
      _.set($scope.wizard, 'isNextDisabled', true);
      processOnboardStatus();
    }

    init();
  }
})();
