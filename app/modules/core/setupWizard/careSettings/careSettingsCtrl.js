var HttpStatus = require('http-status-codes');
(function () {
  'use strict';

  angular.module('Core')
    .controller('CareSettingsCtrl', CareSettingsCtrl);

  function CareSettingsCtrl($interval, $q, $scope, $translate, Authinfo, AutoAttendantConfigService, FeatureToggleService, Log, Notification, SunlightConfigService, URService) {
    var vm = this;

    vm.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
      INITIALIZING: 'Initializing',
    };

    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';

    vm.DEFAULT_QUEUE = 'Queue 1';

    vm.defaultQueueStatus = vm.status.UNKNOWN;
    vm.csOnboardingStatus = vm.status.UNKNOWN;
    vm.appOnboardingStatus = vm.status.UNKNOWN;
    vm.jwtAppOnboardingStatus = vm.status.UNKNOWN;
    vm.cesOnboardingStatus = vm.status.UNKNOWN;

    vm.defaultQueueId = Authinfo.getOrgId();
    vm.careSetupDoneByAdmin = (Authinfo.getOrgId() === Authinfo.getUserOrgId());

    vm.state = vm.status.UNKNOWN;
    vm.sunlightOnboardingState = vm.status.UNKNOWN;
    vm.errorCount = 0;

    function onboardCareWithOtherApps() {
      var promises = {};
      if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardCS = SunlightConfigService.onBoardCare();
        promises.onBoardCS.then(function (result) {
          if (result.status === HttpStatus.ACCEPTED) {
            vm.csOnboardingStatus = vm.status.SUCCESS;
          }
        }).catch(_.noop);
      }
      if (vm.careSetupDoneByAdmin) {
        if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
          promises.onBoardBotApp = SunlightConfigService.onboardCareBot();
          promises.onBoardBotApp.then(function (result) {
            if (result.status === HttpStatus.NO_CONTENT) {
              vm.appOnboardingStatus = vm.status.SUCCESS;
            }
          }).catch(_.noop);
        }
        if (vm.jwtAppOnboardingStatus !== vm.status.SUCCESS) {
          promises.onBoardJwtApp = SunlightConfigService.onboardJwtApp();
          promises.onBoardJwtApp.then(function (result) {
            if (result.status === HttpStatus.NO_CONTENT) {
              vm.jwtAppOnboardingStatus = vm.status.SUCCESS;
            }
          }).catch(_.noop);
        }
      }
      $q.all(promises).then(function (results) {
        Log.debug('Care onboarding is success', results);
        startPolling();
      }, function (error) {
        // config throws 412 if on-boarding is already success, recover the failure.
        if (error.status === 412) {
          Log.debug('Care onboarding is already completed.', error);
          startPolling();
        } else {
          vm.state = vm.NOT_ONBOARDED;
          Log.error('Care onboarding failed with error', error);
          Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.setUpCareFailure'));
        }
      });
    }

    vm.onboardToCare = function () {
      vm.state = vm.IN_PROGRESS;
      if (vm.defaultQueueStatus !== vm.status.SUCCESS) {
        var createQueueRequest = {
          queueId: Authinfo.getOrgId(),
          queueName: vm.DEFAULT_QUEUE,
          notificationUrls: [],
          routingType: 'pick',
        };

        URService.createQueue(createQueueRequest).then(function () {
          vm.defaultQueueStatus = vm.status.SUCCESS;
          onboardCareWithOtherApps();
        })
          .catch(function (error) {
            vm.state = vm.NOT_ONBOARDED;
            Log.error('default queue creation is unsuccessful,' + error);
            Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.setUpCareFailure'));
          });
      } else {
        onboardCareWithOtherApps();
      }
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
          case vm.status.SUCCESS:
            stopPolling();
            Notification.success($translate.instant('firstTimeWizard.careSettingsComplete'));
            vm.state = vm.ONBOARDED;
            enableNext();
            break;
          case vm.status.FAILURE:
            Notification.errorWithTrackingId(result, $translate.instant('firstTimeWizard.setUpCareFailure'));
            vm.state = vm.NOT_ONBOARDED;
            stopPolling();
            break;
          default:
            Log.debug('Care setup status is not Success: ', result);
        }
      })
        .catch(function (error) {
          if (error.status !== 404) {
            Log.debug('Fetching Care setup status failed: ', error);
            if (vm.errorCount++ >= pollErrorCount) {
              vm.state = vm.status.UNKNOWN;
              Notification.errorWithTrackingId(error, 'firstTimeWizard.careSettingsFetchFailed');
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

    function getOnboardingStatus(result) {
      var onboardingStatus = vm.status.UNKNOWN;
      vm.csOnboardingStatus = _.get(result, 'data.csOnboardingStatus');
      if (vm.careSetupDoneByAdmin) {
        onboardingStatus = onboardingDoneByAdminStatus(result);
      } else {
        onboardingStatus = onboardingDoneByPartnerStatus();
      }
      return onboardingStatus;
    }

    function onboardingDoneByAdminStatus(result) {
      var onboardingDoneByAdminStatus = vm.status.UNKNOWN;
      vm.appOnboardingStatus = _.get(result, 'data.appOnboardStatus');
      vm.jwtAppOnboardingStatus = _.get(result, 'data.jwtAppOnboardingStatus');
      if (vm.defaultQueueStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.defaultQueueStatus;
      } else if (vm.csOnboardingStatus === vm.status.SUCCESS && vm.appOnboardingStatus === vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.jwtAppOnboardingStatus;
      } else if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.csOnboardingStatus;
      } else if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.appOnboardingStatus;
      }
      return onboardingDoneByAdminStatus;
    }

    function onboardingDoneByPartnerStatus() {
      var onboardingDoneByPartnerStatus = vm.status.UNKNOWN;
      if (vm.defaultQueueStatus !== vm.status.SUCCESS) {
        onboardingDoneByPartnerStatus = vm.defaultQueueStatus;
      } else {
        onboardingDoneByPartnerStatus = vm.csOnboardingStatus;
      }
      return onboardingDoneByPartnerStatus;
    }

    function enableNext() {
      _.set($scope.wizard, 'isNextDisabled', false);
    }

    function disableNext() {
      _.set($scope.wizard, 'isNextDisabled', true);
    }

    function getOnboardingStatusFromOrgChatConfig() {
      return SunlightConfigService.getChatConfig().then(function (result) {
        var onboardingStatus = getOnboardingStatus(result);
        switch (onboardingStatus) {
          case vm.status.PENDING:
            vm.sunlightOnboardingState = vm.IN_PROGRESS;
            startPolling();
            break;
          case vm.status.SUCCESS:
            vm.sunlightOnboardingState = vm.ONBOARDED;
            break;
          default:
            vm.sunlightOnboardingState = vm.NOT_ONBOARDED;
        }
      })
        .catch(function (error) {
          if (error.status === 404) {
            vm.sunlightOnboardingState = vm.NOT_ONBOARDED;
          } else {
            Log.debug('Fetching Care setup status, on load, failed: ', error);
          }
        });
    }

    function setViewModelStateFromCsConfigForAA() {
      if (vm.sunlightOnboardingState === vm.ONBOARDED) {
        AutoAttendantConfigService.getCSConfig().then(function (result) {
          var csOnboardingStatusForAA = _.get(result, 'data.csOnboardingStatus', vm.status.UNKNOWN);
          switch (csOnboardingStatusForAA) {
            case vm.status.SUCCESS:
              vm.state = vm.ONBOARDED;
              enableNext();
              break;
            default:
              vm.state = vm.NOT_ONBOARDED;
          }
        })
          .catch(function (error) {
            Log.debug('Fetching cs onboarding status for AA, on load, failed:', error);
            vm.state = vm.NOT_ONBOARDED;
          });
      } else {
        setVmStateFromSunlightState();
      }
    }

    function setVmStateFromSunlightState() {
      vm.state = vm.sunlightOnboardingState;
      if (vm.state === vm.ONBOARDED) {
        enableNext();
      }
    }

    function setViewModelStateForAA(sunlightPromise) {
      sunlightPromise.then(function () {
        FeatureToggleService.supports(FeatureToggleService.features.huronAAContextService).then(function (results) {
          if (results) {
            setViewModelStateFromCsConfigForAA();
          } else {
            setVmStateFromSunlightState();
          }
        })
          .catch(function () {
            setVmStateFromSunlightState();
          });
      });
    }


    function init() {
      disableNext();
      var sunlightPromise;
      URService.getQueue(vm.defaultQueueId).then(function () {
        vm.defaultQueueStatus = vm.status.SUCCESS;
        sunlightPromise = getOnboardingStatusFromOrgChatConfig();
        setViewModelStateForAA(sunlightPromise);
      })
        .catch(function (error) {
          sunlightPromise = getOnboardingStatusFromOrgChatConfig();
          if (error.status === 404) {
            vm.sunlightOnboardingState = vm.NOT_ONBOARDED;
          } else {
            Log.debug('Fetching default queue status, on load, failed: ', error);
          }
          setViewModelStateForAA(sunlightPromise);
        });
    }

    init();
  }
})();
