(function () {
  'use strict';

  angular.module('Core')
    .controller('CareSettingsCtrl', CareSettingsCtrl);

  function CareSettingsCtrl($http, $interval, $scope, $window, Authinfo, Log, Notification, TokenService, UrlConfig) {
    var vm = this;
    var callbackUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/csonboard?accessToken='
      + TokenService.getAccessToken();
    vm.ccfsUrl = UrlConfig.getCcfsUrl() + callbackUrl;

    var UNKNOWN = 'unknown';
    var ONBOARDED = 'onboarded';
    var NOT_ONBOARDED = 'notOnboarded';
    var IN_PROGRESS = 'inProgress';
    var FAILED = 'failed';

    vm.state = UNKNOWN;
    vm.error = undefined;

    vm.onboardToCs = function () {
      $window.open(vm.ccfsUrl, '_blank');
      vm.state = IN_PROGRESS;
      startPolling();
    };

    var poller;
    var pollInterval = 10000;
    var pollRetryCount = 30;
    $scope.$on('$destroy', function () {
      $interval.cancel(poller);
      poller = undefined;
    });

    function startPolling() {
      if (!_.isUndefined(poller)) return;

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
      $scope.getStatus().then(function (result) {
        Log.debug('CS salt: ', result);
        if (_.get(result, 'data.name')) {
          if (vm.state === IN_PROGRESS) {
            Notification.success('Care Setup completed.');
          }
          vm.state = ONBOARDED;
          vm.error = undefined;
          _.set($scope.wizard, 'isNextDisabled', false);
          stopPolling();
        } else {
          Log.debug('Bad response from CS: ' + result);
        }
      }, function (result) {
        if (result.status === 404) {
          if (vm.state === UNKNOWN) {
            vm.state = NOT_ONBOARDED;
          }
        } else {
          vm.state = UNKNOWN; // if getting status fails, allow proceeding with setup
          Notification.error('Error retrieving onboarding status.');
          _.set($scope.wizard, 'isNextDisabled', false);
          stopPolling();
        }
      });
    }

    function processTimeout(pollerResult) {
      Log.debug('Poll timed out after ' + pollerResult + ' attempts.');
      vm.error = 'Timeout';
      vm.state = FAILED;
      Notification.error('Timed out checking onbaording status.');
    }

    $scope.getStatus = function () {
      var url = 'https://management.produs1.ciscoccservice.com/management/property/v1/user/propertyName/org.search.hash.salt';
      var config = {
        headers: {
          'Authorization': 'Bearer ' + TokenService.getAccessToken()
        }
      };
      Log.debug('getStatus called.');
      return $http.get(url, config);
    };

    processOnboardStatus();
    _.set($scope.wizard, 'isNextDisabled', vm.state !== ONBOARDED);
  }
})();
