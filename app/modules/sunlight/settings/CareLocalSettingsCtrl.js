var HttpStatus = require('http-status-codes');
(function () {
  'use strict';

  // TODO: no console logging should remain in production code

  angular
    .module('Sunlight')
    .controller('CareLocalSettingsCtrl', CareLocalSettingsCtrl);

  /* @ngInject */
  function CareLocalSettingsCtrl($element, $interval, $location, $q, $scope, $translate, AccessibilityService, AutoAttendantConfigService, Authinfo, ContextAdminAuthorizationService, FeatureToggleService, Log, Notification, ModalService, SunlightUtilitiesService, SunlightConfigService, URService) {
    var vm = this;

    vm.ONBOARDED = 'onboarded';
    vm.NOT_ONBOARDED = 'notOnboarded';
    vm.IN_PROGRESS = 'inProgress';
    vm.ADMIN_AUTHORIZED = 'Authorized';

    vm.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
      INITIALIZING: 'Initializing',
    };

    vm.defaultQueueStatus = vm.status.UNKNOWN;
    vm.csOnboardingStatus = vm.status.UNKNOWN;
    vm.aaOnboardingStatus = vm.status.UNKNOWN;
    vm.appOnboardingStatus = vm.status.UNKNOWN;
    vm.jwtAppOnboardingStatus = vm.status.UNKNOWN;
    vm.cesOnboardingStatus = vm.status.UNKNOWN;
    vm.migrationStatus = vm.status.UNKNOWN;
    vm.defaultQueueId = Authinfo.getOrgId();
    vm.careSetupDoneByOrgAdmin = (Authinfo.getOrgId() === Authinfo.getUserOrgId());

    vm.state = vm.ONBOARDED;
    vm.sunlightOnboardingState = vm.ONBOARDED;
    vm.errorCount = 0;

    vm.RoutingType = {
      PICK: 'pick',
      PUSH: 'push',
    };

    vm.routingTypes = [
      {
        Header: $translate.instant('sunlightDetails.settings.routing.pick.Header'),
        Label: $translate.instant('sunlightDetails.settings.routing.pick.Label'),
        Value: vm.RoutingType.PICK,
      },
      {
        Header: $translate.instant('sunlightDetails.settings.routing.automated.Header'),
        Label: $translate.instant('sunlightDetails.settings.routing.automated.Label'),
        Value: vm.RoutingType.PUSH,
      },
    ];

    vm.featureToggles = {
      showRouterToggle: false,
      chatToVideoFeatureToggle: false,
      contextServiceOnboardingFeatureToggle: false,
    };

    var maxChatCount = 5;
    vm.orgQueueConfigDataModel = {
      routingType: vm.RoutingType.PICK,
    };
    vm.orgChatConfigDataModel = {
      chatCount: maxChatCount,
      videoInChatToggle: true,
    };

    vm.enableRoutingMechanism = function () {
      return !vm.queueConfig.selectedRouting;
    };

    vm.queueConfig = {
      selectedRouting: vm.RoutingType.PICK,
    };
    vm.orgChatConfig = {
      selectedChatCount: maxChatCount,
      selectedVideoInChatToggle: true,
    };

    vm.chatCountOptions = _.range(1, 6);

    vm.isAdminAuthorized = false;
    vm.isSynchronizationInProgress = false;
    vm.synchronizeButtonTooltip = '';
    vm.synchronize = function () {
      vm.isSynchronizationInProgress = true;
      return ContextAdminAuthorizationService.synchronizeAdmins()
        .then(function () {
          Notification.success('context.dictionary.settingPage.synchronizationSuccessful');
        })
        .catch(function () {
          Notification.error('context.dictionary.settingPage.synchronizationFailure');
        })
        .finally(function () {
          vm.isSynchronizationInProgress = false;
        });
    };

    vm.isSynchronizationDisabled = function () {
      return vm.isSynchronizationInProgress || !vm.isAdminAuthorized;
    };

    $scope.$on('$locationChangeStart', function (event, next) {
      if ($scope.orgConfigForm.$dirty) {
        event.preventDefault();
        var message = 'sunlightDetails.settings.saveModal.BodyMsg2';
        vm.openSaveModal(message).result.then(function () {
          vm.saveQueueConfigurations();
          vm.saveOrgChatConfigurations();
          gotoSelectedPage(next);
        }, function () {
          gotoSelectedPage(next);
        });
      }
    });

    function gotoSelectedPage(next) {
      $scope.$$listeners.$locationChangeStart = [];
      var destination = next.substr(next.indexOf('#') + 1, next.length).trim();
      $location.path(destination);
    }

    vm.openModal = function () {
      var message = 'sunlightDetails.settings.saveModal.BodyMsg1';
      vm.openSaveModal(message).result.then(function () {
        vm.saveQueueConfigurations();
        vm.saveOrgChatConfigurations();
      });
    };

    vm.openSaveModal = function (message) {
      return ModalService.open({
        title: $translate.instant('sunlightDetails.settings.saveModal.Header'),
        message: $translate.instant(message),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
      });
    };

    function createOrUpdateQueue(queueConfig) {
      vm.isQueueProcessing = true;
      URService.getQueue(vm.defaultQueueId).then(function () {
        var updateQueueRequest = {
          queueName: 'DEFAULT',
          routingType: queueConfig.routingType,
          notificationUrls: queueConfig.notificationUrls,
        };
        URService.updateQueue(vm.defaultQueueId, updateQueueRequest).then(function (results) {
          vm.defaultQueueStatus = vm.status.SUCCESS;
          var onboardingStatus = onboardingStatusDoneByAdminOrPartner();
          setViewModelState(onboardingStatus);
          Log.debug('Care settings: Org chat configurations updated successfully', results);
          vm.isQueueProcessing = false;
          updateSavedQueueConfiguration();
        }, function (error) {
          vm.defaultQueueStatus = vm.status.UNKNOWN;
          vm.isQueueProcessing = false;
          vm.cancelEdit();
          Log.error('Care settings: Org chat configurations update is a failure', error);
          Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.careSettingsUpdateFailed'));
        });
      }, function (err) {
        if (err.status === 404) {
          var createQueueRequest = {
            queueId: Authinfo.getOrgId(),
            queueName: 'DEFAULT',
            notificationUrls: queueConfig.notificationUrls,
            routingType: queueConfig.routingType,
          };
          URService.createQueue(createQueueRequest).then(function (results) {
            vm.defaultQueueStatus = vm.status.SUCCESS;
            var onboardingStatus = onboardingStatusDoneByAdminOrPartner();
            setViewModelState(onboardingStatus);
            Log.debug('Care settings: Org chat configurations updated successfully', results);
            vm.isQueueProcessing = false;
            updateSavedQueueConfiguration();
          }, function (error) {
            vm.defaultQueueStatus = vm.status.UNKNOWN;
            vm.isQueueProcessing = false;
            vm.cancelEdit();
            Log.error('Care settings: Org chat configurations update is a failure', error);
            Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.careSettingsUpdateFailed'));
          });
        }
      });
    }

    vm.saveQueueConfigurations = function () {
      var queueConfig = getRoutingTypeFromView();
      createOrUpdateQueue(queueConfig);
    };

    vm.saveOrgChatConfigurations = function () {
      vm.isProcessing = true;
      var orgChatConfig = getOrgChatConfigFromView();
      SunlightConfigService.updateChatConfig(orgChatConfig).then(function (results) {
        Log.debug('Care settings: Org chat configurations updated successfully', results);
        Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
        vm.isProcessing = false;
        updateSavedConfiguration();
      }, function (error) {
        vm.isProcessing = false;
        vm.cancelEdit();
        Log.error('Care settings: Org chat configurations update is a failure', error);
        Notification.errorWithTrackingId(error, $translate.instant('firstTimeWizard.careSettingsUpdateFailed'));
      });
    };

    function updateSavedQueueConfiguration() {
      vm.orgQueueConfigDataModel.routingType = vm.queueConfig.selectedRouting;
    }
    function updateSavedConfiguration() {
      vm.orgChatConfigDataModel.chatCount = vm.orgChatConfig.selectedChatCount;
      vm.orgChatConfigDataModel.videoInChatToggle = vm.orgChatConfig.selectedVideoInChatToggle;
      resetForm();
    }

    vm.cancelEdit = function () {
      vm.queueConfig.selectedRouting = vm.orgQueueConfigDataModel.routingType;
      vm.orgChatConfig.selectedChatCount = vm.orgChatConfigDataModel.chatCount;
      vm.orgChatConfig.selectedVideoInChatToggle = vm.orgChatConfigDataModel.videoInChatToggle;
      resetForm();
    };

    function resetForm() {
      if ($scope.orgConfigForm) {
        $scope.orgConfigForm.$setPristine();
        $scope.orgConfigForm.$setUntouched();
      }
    }

    function getRoutingTypeFromView() {
      var queueConfig = {};
      queueConfig.routingType = vm.queueConfig.selectedRouting;
      queueConfig.notificationUrls = [];
      return queueConfig;
    }

    function getOrgChatConfigFromView() {
      var orgChatConfig = {};
      orgChatConfig.videoCallEnabled = vm.orgChatConfig.selectedVideoInChatToggle;
      orgChatConfig.maxChatCount = parseInt(vm.orgChatConfig.selectedChatCount, 10);
      return orgChatConfig;
    }

    function populateQueueConfigViewModel(result, isCalledOnInit) {
      if (isCalledOnInit) {
        vm.orgQueueConfigDataModel.routingType = _.get(result, 'data.routingType', vm.RoutingType.PICK);
        vm.queueConfig.selectedRouting = vm.orgQueueConfigDataModel.routingType;
      }
    }

    function populateOrgChatConfigViewModel(result, isCalledOnInit) {
      vm.csOnboardingStatus = _.get(result, 'data.csOnboardingStatus');
      vm.aaOnboardingStatus = _.get(result, 'data.aaOnboardingStatus');
      vm.appOnboardingStatus = _.get(result, 'data.appOnboardStatus');
      vm.jwtAppOnboardingStatus = _.get(result, 'data.jwtAppOnboardingStatus');

      if (isCalledOnInit) {
        vm.orgChatConfigDataModel.chatCount = _.get(result, 'data.maxChatCount', maxChatCount);
        vm.orgChatConfig.selectedChatCount = vm.orgChatConfigDataModel.chatCount;

        vm.orgChatConfigDataModel.videoInChatToggle = _.get(result, 'data.videoCallEnabled', true);
        vm.orgChatConfig.selectedVideoInChatToggle = vm.orgChatConfigDataModel.videoInChatToggle;
      }
    }
    function onboardCareWithOtherApps() {
      var promises = {};
      if (vm.migrationStatus !== vm.status.SUCCESS) {
        promises.migrateCS = ContextAdminAuthorizationService.migrateOrganization();
        promises.migrateCS.then(function () {
          vm.migrationStatus = vm.status.SUCCESS;
        });
      }
      if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardCS = SunlightConfigService.onBoardCare();
        promises.onBoardCS.then(function (result) {
          if (result.status === HttpStatus.ACCEPTED) {
            vm.csOnboardingStatus = vm.status.SUCCESS;
          }
        });
      }
      if (Authinfo.isCareVoice() && vm.aaOnboardingStatus !== vm.status.SUCCESS) {
        promises.onBoardAA = SunlightConfigService.aaOnboard();
        promises.onBoardAA.then(function (result) {
          if (result.status === HttpStatus.NO_CONTENT) {
            vm.aaOnboardingStatus = vm.status.SUCCESS;
          }
        });
      }
      if (vm.careSetupDoneByOrgAdmin) {
        if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
          promises.onBoardBotApp = SunlightConfigService.onboardCareBot();
          promises.onBoardBotApp.then(function (result) {
            if (result.status === HttpStatus.NO_CONTENT) {
              vm.appOnboardingStatus = vm.status.SUCCESS;
            }
          });
        }
        if (vm.jwtAppOnboardingStatus !== vm.status.SUCCESS) {
          promises.onBoardJwtApp = SunlightConfigService.onboardJwtApp();
          promises.onBoardJwtApp.then(function (result) {
            if (result.status === HttpStatus.NO_CONTENT) {
              vm.jwtAppOnboardingStatus = vm.status.SUCCESS;
            }
          });
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
          queueName: 'DEFAULT',
          notificationUrls: [],
          routingType: 'pick',
        };

        URService.createQueue(createQueueRequest).then(function () {
          vm.defaultQueueStatus = vm.status.SUCCESS;
          onboardCareWithOtherApps();
        })
          .catch(function (error) {
            Log.debug('default queue creation is unsuccessful,' + error);
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
    function startPollingForAA() {
      if (!_.isUndefined(poller)) return;
      vm.errorCount = 0;
      poller = $interval(setViewModelStateForAAOnboardToCare, pollInterval, pollRetryCount);
      poller.then(processTimeout);
    }

    function stopPolling() {
      if (!_.isUndefined(poller)) {
        $interval.cancel(poller);
        poller = undefined;
      }
    }

    function setViewModelState(onboardingStatus) {
      switch (onboardingStatus) {
        case vm.status.SUCCESS:
          vm.state = vm.ONBOARDED;
          break;
        case vm.status.PENDING:
          vm.state = vm.IN_PROGRESS;
          startPolling();
          break;
        default:
          vm.state = vm.NOT_ONBOARDED;
      }
    }
    function onboardAAToCare() {
      FeatureToggleService.supports(FeatureToggleService.features.huronAAContextService).then(function (results) {
        if (results) {
          AutoAttendantConfigService.cesOnboard().then(function (result) {
            if (result.status === HttpStatus.NO_CONTENT) {
              startPollingForAA();
            } else if (result.status === 226) {
              Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
              vm.state = vm.ONBOARDED;
            }
          })
            .catch(function (error) {
              if (error.status === 409) {
                startPollingForAA();
              } else {
                vm.state = vm.NOT_ONBOARDED;
                Notification.errorWithTrackingId($translate.instant('sunlightDetails.settings.setUpCareFailure'));
              }
            });
        } else {
          Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
          vm.state = vm.ONBOARDED;
        }
      })
        .catch(function () {
          Notification.errorWithTrackingId($translate.instant('sunlightDetails.settings.setUpCareFailure'));
          vm.state = vm.NOT_ONBOARDED;
        });
    }
    function processOnboardStatus() {
      var promises = {};
      promises.getQueue = URService.getQueue(vm.defaultQueueId);
      promises.getChatConfig = SunlightConfigService.getChatConfig();
      $q.all(promises).then(function (result) {
        populateQueueConfigViewModel(result.getQueue);
        populateOrgChatConfigViewModel(result.getChatConfig);
        var onboardingStatus = getOnboardingStatus();
        switch (onboardingStatus) {
          case vm.status.SUCCESS:
            SunlightUtilitiesService.removeCareSetupKey();
            stopPolling();
            onboardAAToCare();
            break;
          case vm.status.FAILURE:
            Notification.errorWithTrackingId(result, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
            vm.state = vm.NOT_ONBOARDED;
            stopPolling();
            break;
          default:
            Log.debug('Care setup status is not Success: ', result);
        }
      }, function (error) {
        if (error.status !== 404) {
          if (vm.errorCount++ >= pollErrorCount) {
            vm.state = vm.NOT_ONBOARDED;
            Notification.errorWithTrackingId(error, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
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

    function getOnboardingStatus() {
      return onboardingStatusDoneByAdminOrPartner();
    }

    function onboardingStatusDoneByAdminOrPartner() {
      var onboardingStatus = vm.status.UNKNOWN;
      if (vm.careSetupDoneByOrgAdmin) {
        onboardingStatus = onboardingDoneByAdminStatus();
      } else {
        onboardingStatus = onboardingDoneByPartnerStatus();
      }
      return onboardingStatus;
    }

    function onboardingDoneByAdminStatus() {
      var onboardingDoneByAdminStatus = vm.status.UNKNOWN;
      var aaOnboarded = onboardingStatusForAA();
      if (vm.defaultQueueStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.defaultQueueStatus;
      } else if (vm.csOnboardingStatus === vm.status.SUCCESS && vm.appOnboardingStatus === vm.status.SUCCESS
        && aaOnboarded === vm.status.SUCCESS && vm.migrationStatus === vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.jwtAppOnboardingStatus;
      } else if (aaOnboarded !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = aaOnboarded;
      } else if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.csOnboardingStatus;
      } else if (vm.appOnboardingStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.appOnboardingStatus;
      } else if (vm.migrationStatus !== vm.status.SUCCESS) {
        onboardingDoneByAdminStatus = vm.migrationStatus;
      }
      return onboardingDoneByAdminStatus;
    }

    function onboardingDoneByPartnerStatus() {
      var onboardingDoneByPartnerStatus = vm.status.UNKNOWN;
      if (vm.defaultQueueStatus !== vm.status.SUCCESS) {
        onboardingDoneByPartnerStatus = vm.defaultQueueStatus;
      } else if (vm.csOnboardingStatus === vm.status.SUCCESS && vm.migrationStatus === vm.status.SUCCESS) {
        onboardingDoneByPartnerStatus = onboardingStatusForAA();
      } else if (vm.csOnboardingStatus !== vm.status.SUCCESS) {
        onboardingDoneByPartnerStatus = vm.csOnboardingStatus;
      } else if (vm.migrationStatus !== vm.status.SUCCESS) {
        onboardingDoneByPartnerStatus = vm.migrationStatus;
      }
      return onboardingDoneByPartnerStatus;
    }

    function onboardingStatusForAA() {
      var status;
      if (Authinfo.isCareVoice()) {
        status = vm.aaOnboardingStatus;
      } else {
        status = vm.status.SUCCESS;
      }
      return status;
    }

    function getOnboardStatusAndUpdateConfigIfRequired(result) {
      var onboardingStatus = getOnboardingStatus();
      setSunlightConfigState(onboardingStatus);
      if (result.data.orgName === '' || !(_.get(result, 'data.orgName'))) {
        result.data.orgName = Authinfo.getOrgName();
        SunlightConfigService.updateChatConfig(result.data).then(function (result) {
          Log.debug('Successfully updated org config with org name', result);
        });
      }
    }

    function setSunlightConfigState(onboardingStatus) {
      switch (onboardingStatus) {
        case vm.status.SUCCESS:
          vm.sunlightOnboardingState = vm.ONBOARDED;
          break;
        case vm.status.PENDING:
          vm.sunlightOnboardingState = vm.IN_PROGRESS;
          startPolling();
          break;
        default:
          vm.sunlightOnboardingState = vm.NOT_ONBOARDED;
      }
    }


    function getOnboardingStatusFromOrgChatConfig() {
      var promises = {};
      promises.getMigrationStatus = getMigrationStatus(); // This needs to be removed once all the orgs are migrated to New CS Onboarding
      promises.getConfigPromise = SunlightConfigService.getChatConfig();
      return $q.all(promises).then(function (result) {
        populateOrgChatConfigViewModel(result.getConfigPromise, true);
        getOnboardStatusAndUpdateConfigIfRequired(result.getConfigPromise);
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
              break;
            default:
              vm.state = vm.NOT_ONBOARDED;
          }
        })
          .catch(function (error) {
            Log.debug('Failed getting Cs onboarding status for AA ', error);
            vm.state = vm.NOT_ONBOARDED;
          });
      } else {
        setVmStateFromSunlightState();
      }
    }

    function setViewModelStateForAAOnboardToCare() {
      AutoAttendantConfigService.getCSConfig().then(function (result) {
        var csOnboardingStatusForAA = _.get(result, 'data.csOnboardingStatus', vm.status.UNKNOWN);
        switch (csOnboardingStatusForAA) {
          case vm.status.SUCCESS:
            vm.state = vm.ONBOARDED;
            Notification.success($translate.instant('sunlightDetails.settings.setUpCareSuccess'));
            stopPolling();
            break;
          case vm.status.FAILURE:
            vm.state = vm.NOT_ONBOARDED;
            Notification.errorWithTrackingId($translate.instant('sunlightDetails.settings.setUpCareFailure'));
            stopPolling();
            break;
          case vm.status.INITIALIZING:
            vm.state = vm.IN_PROGRESS;
            break;
          default:
            Notification.errorWithTrackingId($translate.instant('sunlightDetails.settings.setUpCareFailure'));
            vm.state = vm.NOT_ONBOARDED;
            stopPolling();
        }
      })
        .catch(function (error) {
          if (error.status !== 404) {
            Log.debug('Fetching Care setup status failed for AA: ', error);
            if (vm.errorCount++ >= pollErrorCount) {
              vm.state = vm.NOT_ONBOARDED;
              Notification.errorWithTrackingId(error, $translate.instant('sunlightDetails.settings.setUpCareFailure'));
              stopPolling();
            }
          }
        });
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

    function setVmStateFromSunlightState() {
      vm.state = vm.sunlightOnboardingState;
    }

    function getMigrationStatus() {
      return ContextAdminAuthorizationService.isMigrationNeeded().then(function (needMigration) {
        if (needMigration) {
          vm.migrationStatus = vm.status.FAILURE;
        } else {
          vm.migrationStatus = vm.status.SUCCESS;
        }
      });
    }

    function init() {
      FeatureToggleService.atlasCareAutomatedRouteTrialsGetStatus().then(function (result) {
        vm.featureToggles.showRouterToggle = result;
      });

      FeatureToggleService.atlasCareChatToVideoTrialsGetStatus().then(function (result) {
        vm.featureToggles.chatToVideoFeatureToggle = result && Authinfo.isCare();
      });

      FeatureToggleService.supports(FeatureToggleService.features.atlasContextServiceOnboarding).then(function (supports) {
        vm.featureToggles.contextServiceOnboardingFeatureToggle = supports;
      });
      var sunlightPromise;
      URService.getQueue(vm.defaultQueueId).then(function (result) {
        vm.defaultQueueStatus = vm.status.SUCCESS;
        populateQueueConfigViewModel(result, true);
        sunlightPromise = getOnboardingStatusFromOrgChatConfig();
        setViewModelStateForAA(sunlightPromise);
        return sunlightPromise;
      }).catch(function (error) {
        sunlightPromise = getOnboardingStatusFromOrgChatConfig();
        if (error.status === 404) {
          vm.state = vm.NOT_ONBOARDED;
        } else {
          Log.debug('Fetching default Queue status, on load, failed: ', error);
        }
        setViewModelStateForAA(sunlightPromise);
        return sunlightPromise;
      }).finally(function () {
        // set the initial page focus
        if (vm.state === vm.IN_PROGRESS || vm.state === vm.ONBOARDED) {
          AccessibilityService.setFocus($element, '[name="selectedRouting"]');
        } else {
          AccessibilityService.setFocus($element, '#ccfsBtn');
        }
      });

      ContextAdminAuthorizationService.getAdminAuthorizationStatus()
        .then(function (status) {
          vm.isAdminAuthorized = (status === vm.ADMIN_AUTHORIZED);
        })
        .then(function () {
          vm.synchronizeButtonTooltip = !vm.isAdminAuthorized
            ? $translate.instant('context.dictionary.settingPage.unauthorizedTooltip') : '';
        });
    }

    init();
  }
})();

