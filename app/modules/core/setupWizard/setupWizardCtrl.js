require('./_setup-wizard.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('SetupWizardCtrl', SetupWizardCtrl);

  function SetupWizardCtrl($q, $scope, $state, $stateParams, Authinfo, Config, FeatureToggleService, Orgservice, SetupWizardService, Utils) {
    var isFirstTimeSetup = _.get($state, 'current.data.firstTimeSetup', false);
    var shouldRemoveSSOSteps = false;
    var isSharedDevicesOnlyLicense = false;
    var shouldShowMeetingsTab = false;
    var hasPendingCallLicenses = false;
    var supportsAtlasPMRonM2 = false;
    $scope.tabs = [];
    $scope.isTelstraCsbEnabled = false;
    $scope.isCSB = Authinfo.isCSB();

    if (Authinfo.isCustomerAdmin()) {
      initToggles().finally(init);
    }

    function initToggles() {
      if (isFirstTimeSetup) {
        shouldRemoveSSOSteps = true;
      }

      var tabsBasedOnPendingLicensesPromise = SetupWizardService.getPendingLicenses()
        .then(function () {
          shouldShowMeetingsTab = SetupWizardService.hasPendingMeetingLicenses();
          hasPendingCallLicenses = SetupWizardService.hasPendingCallLicenses();
        });

      var hI1484Promise = FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (ishI1484) {
          $scope.ishI1484 = ishI1484;
        });

      var adminOrgUsagePromise = Orgservice.getAdminOrgUsage()
        .then(function (subscriptions) {
          var licenseTypes = Utils.getDeepKeyValues(subscriptions, 'licenseType');
          isSharedDevicesOnlyLicense = _.without(licenseTypes, Config.licenseTypes.SHARED_DEVICES).length === 0;
        })
        .catch(_.noop);

      var atlasPMRonM2Promise = FeatureToggleService.supports(FeatureToggleService.features.atlasPMRonM2)
        .then(function (_supportsAtlasPMRonM2) {
          supportsAtlasPMRonM2 = _supportsAtlasPMRonM2;
        });

      return $q.all([
        adminOrgUsagePromise,
        atlasPMRonM2Promise,
<<<<<<< a2f1262a45e373c19203a987cb9cfb37a30fa52e
        meetingSettingsTabPromise,
=======
        tenDigitExtPromise,
        tabsBasedOnPendingLicensesPromise,
>>>>>>> feat(core): Show Call Settings tab based on pending call licenses
        hI1484Promise,
      ]);
    }

    function init() {
      var tabs = getInitTabs();

      initEnterpriseSettingsTab(tabs);
      initMeetingSettingsTab(tabs);
      initCallSettingsTab(tabs);
      initCareTab(tabs);

      initSharedDeviceOnly(tabs);
      initAtlasPMRonM2(tabs);
      initFinishTab(tabs);
      removeTabsWithEmptySteps(tabs);
      $scope.tabs = filterTabsByStateParams(tabs);
    }

    function getInitTabs() {
      return [{
        name: 'planReview',
        label: 'firstTimeWizard.planReview',
        description: 'firstTimeWizard.planReviewSub',
        icon: 'icon-plan-review',
        title: 'firstTimeWizard.planReview',
        controller: 'PlanReviewCtrl as planReview',
        steps: [{
          name: 'init',
          template: 'modules/core/setupWizard/planReview/planReview.tpl.html',
        }],
      }, {
        name: 'messagingSetup',
        label: 'firstTimeWizard.messageSettings',
        description: 'firstTimeWizard.messagingSetupSub',
        icon: 'icon-convo',
        title: 'firstTimeWizard.messagingSetup',
        controller: 'MessagingSetupCtrl as msgSetup',
        steps: [{
          name: 'setup',
          template: 'modules/core/setupWizard/messageSettings/messagingSetup.tpl.html',
        }],
      }, {
        name: 'enterpriseSettings',
        label: 'firstTimeWizard.enterpriseSettings',
        description: 'firstTimeWizard.enterpriseSettingsSub',
        icon: 'icon-settings',
        title: 'firstTimeWizard.enterpriseSettings',
        controller: 'EnterpriseSettingsCtrl as entprCtrl',
        steps: [{
          name: 'enterpriseSipUrl',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.setSipDomain.tpl.html',
        }, {
          name: 'init',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.init.tpl.html',
        }, {
          name: 'exportMetadata',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.exportMetadata.tpl.html',
        }, {
          name: 'importIdp',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.importIdp.tpl.html',
        }, {
          name: 'testSSO',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.testSSO.tpl.html',
        }],
      },
      ];
    }

    function initMeetingSettingsTab(tabs) {
      var meetingTab = {
        name: 'meetingSettings',
        required: true,
        label: 'firstTimeWizard.meetingSettings',
        description: 'firstTimeWizard.setupMeetingService',
        icon: 'icon-conference',
        title: 'firstTimeWizard.setupWebexMeetingSites',
        controller: 'MeetingSettingsCtrl as meetingCtrl',
        controllerAs: 'meetingCtrl',
        steps: [{
          name: 'migrateTrial',
          template: 'modules/core/setupWizard/meeting-settings/meeting-migrate-trial.html',
        },
        {
          name: 'siteSetup',
          template: 'modules/core/setupWizard/meeting-settings/meeting-site-setup.html',
        },
        {
          name: 'licenseDistribution',
          template: 'modules/core/setupWizard/meeting-settings/meeting-license-distribution.html',
        },
        {
          name: 'summary',
          template: 'modules/core/setupWizard/meeting-settings/meeting-summary.html',
        }],
      };

      if (shouldShowMeetingsTab) {
        if (!hasWebexMeetingTrial()) {
          _.remove(meetingTab.steps, { name: 'migrateTrial' });
        }

        tabs.splice(1, 0, meetingTab);
      }
    }

    function initEnterpriseSettingsTab(tabs) {
      if (shouldRemoveSSOSteps) {
        var enterpriseSettingTab = _.find(tabs, {
          name: 'enterpriseSettings',
        }, {});
        var ssoInitIndex = _.findIndex(enterpriseSettingTab.steps, {
          name: 'init',
        });
        if (ssoInitIndex > -1) {
          enterpriseSettingTab.steps.splice(ssoInitIndex);
        }
        if (isSharedDevicesOnlyLicense) {
          enterpriseSettingTab.steps = _.filter(enterpriseSettingTab.steps, function (step) {
            return step.name !== 'exportMetadata' || step.name !== 'importIdp' || step.name !== 'testSSO';
          });
        }
      }
    }

    function initCallSettingsTab(tabs) {
      var initialStep = {
        name: 'setup',
        template: 'modules/core/setupWizard/callSettings/serviceSetupInit.html',
      };
      if (showCallSettings()) {
        var steps = [{
          name: 'init',
          template: 'modules/core/setupWizard/callSettings/serviceSetup.html',
        }];
        if ($scope.ishI1484) {
          steps.splice(0, 0, initialStep);
        }
        tabs.splice(1, 0, {
          name: 'serviceSetup',
          required: true,
          label: 'firstTimeWizard.callSettings',
          description: 'firstTimeWizard.serviceSetupSub',
          icon: 'icon-calls',
          title: 'firstTimeWizard.unifiedCommunication',
          controllerAs: '$ctrl',
          steps: steps,
        });
      }
    }

    function hasWebexMeetingTrial() {
      var conferencingServices = _.filter(Authinfo.getConferenceServices(), { license: { isTrial: true } });

      return _.some(conferencingServices, function (service) {
        return _.get(service, 'license.offerName') === Config.offerCodes.MC || _.get(service, 'license.offerName') === Config.offerCodes.EE;
      });
    }

    function showCallSettings() {
      return _.some(Authinfo.getLicenses(), function (license) {
        return license.licenseType === Config.licenseTypes.COMMUNICATION || license.licenseType === Config.licenseTypes.SHARED_DEVICES;
      }) || hasPendingCallLicenses;
    }

    function initCareTab(tabs) {
      if (Authinfo.isCare()) {
        var careTab = {
          name: 'careSettings',
          label: 'firstTimeWizard.careSettings',
          description: 'firstTimeWizard.careSettingsSub',
          icon: 'icon-headset',
          title: 'firstTimeWizard.careSettings',
          controller: 'CareSettingsCtrl as careSettings',
          steps: [{
            name: 'csonboard',
            template: 'modules/core/setupWizard/careSettings/careSettings.tpl.html',
          }],
        };

        var finishTabIndex = _.findIndex(tabs, function (tab) {
          return (tab.name === 'finish');
        });

        if (finishTabIndex === -1) { // finish tab not found
          tabs.push(careTab);
        } else {
          tabs.splice(finishTabIndex, 0, careTab);
        }
      }
    }


    function initSharedDeviceOnly(tabs) {
      if (isSharedDevicesOnlyLicense) {
        _.remove(tabs, function (tab) {
          return tab.name === 'messagingSetup';
        });
      }
    }

    function initAtlasPMRonM2(tabs) {
      if (supportsAtlasPMRonM2) {
        var step = {
          name: 'enterprisePmrSetup',
          template: 'modules/core/setupWizard/enterpriseSettings/enterprise.pmrSetup.tpl.html',
        };
        var enterpriseSettings = _.find(tabs, {
          name: 'enterpriseSettings',
        });
        if (enterpriseSettings) {
          enterpriseSettings.steps.splice(1, 0, step);
        }
      }
    }

    function initFinishTab(tabs) {
      if (!Authinfo.isSetupDone()) {
        var tab = {
          name: 'finish',
          label: 'firstTimeWizard.finish',
          description: 'firstTimeWizard.finishSub',
          icon: 'icon-check',
          title: 'firstTimeWizard.getStarted',
          controller: 'WizardFinishCtrl',
          steps: [{
            name: 'init',
            template: 'modules/core/setupWizard/finish/finish.tpl.html',
          }],
        };

        if (shouldShowMeetingsTab) {
          tab.title = 'firstTimeWizard.activateAndBeginBilling';
        }
        tabs.push(tab);
      }
    }

    function removeTabsWithEmptySteps(tabs) {
      _.remove(tabs, function (tab) {
        return _.isArray(tab.steps) && tab.steps.length === 0;
      });
    }

    function filterTabsByStateParams(tabs) {
      if (!($stateParams.onlyShowSingleTab && $stateParams.currentTab)) {
        return tabs;
      }

      var filteredTabs = _.filter(tabs, function (tab) {
        return ($stateParams.currentTab === tab.name);
      });

      if ($stateParams.currentStep && filteredTabs.length === 1 && filteredTabs[0].steps) {
        //prevent "back" button if a step is defined in single tab mode:
        var tab = filteredTabs[0];
        var index = _.findIndex(tab.steps, {
          name: $stateParams.currentStep,
        });
        if (index > 0) {
          tab.steps.splice(0, index);
          // currentStep is now 0 index
          index = 0;
        }
        if ($stateParams.numberOfSteps) {
          // if specific number of steps, make sure no steps following
          tab.steps = _.slice(tab.steps, index, index + $stateParams.numberOfSteps);
        }
      }
      return filteredTabs;
    }
  }
})();
