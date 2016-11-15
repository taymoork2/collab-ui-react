(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareLocalSettingsCtrl', CareLocalSettingsCtrl);

  /* @ngInject */
  function CareLocalSettingsCtrl($interval, $scope, $translate, Log, $http, Authinfo, UrlConfig, Notification, SunlightConfigService) {
    var vm = this;

    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.state = vm.ONBOARDED;
    vm.isPartner = true;
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
        if (_.get(result, 'data.csConnString')) {
          Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
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
              vm.state = vm.NOT_ONBOARDED;
              Notification.error($translate.instant('sunlightDetails.settings.setUpCareFailure'));
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

    function isPartner(authData) {
      var roles = authData.roles;
      if (_.indexOf(roles, 'PARTNER_USER') > -1 || _.indexOf(roles, 'PARTNER_ADMIN') > -1) {
        return true;
      }
      return false;
    }

    function init() {
      $http.get(UrlConfig.getAdminServiceUrl() + 'userauthinfo').then(function (authData) {
        if (!isPartner(authData.data)) {
          vm.isPartner = false;
          SunlightConfigService.getChatConfig().then(function (result) {
            if (_.get(result, 'data.csConnString')) {
              vm.state = vm.ONBOARDED;
            }
            if (result.data.orgName == "" || !(_.get(result, 'data.orgName'))) {
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
      })
        .catch(function (result) {
          Log.debug('Fetching of user-info failed: ', result);
        });
    }
    init();
  }

})();
