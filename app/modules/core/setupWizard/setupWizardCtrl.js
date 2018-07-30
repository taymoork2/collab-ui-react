require('./_setup-wizard.scss');

(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var planReviewInitTemplatePath = require('ngtemplate-loader?module=Core!./planReview/planReview.tpl.html');
  var planReviewSelectSubscriptionTemplatePath = require('ngtemplate-loader?module=Core!./planReview/select-subscription.html');

  var enterpriseSetSipDomainTemplatePath = require('ngtemplate-loader?module=Core!./enterpriseSettings/enterprise.setSipDomainSparkAssistant.tpl.html');
  var enterpriseInitTemplatePath = require('ngtemplate-loader?module=Core!./enterpriseSettings/enterprise.init.tpl.html');
  var enterpriseExportMetadataTemplatePath = require('ngtemplate-loader?module=Core!./enterpriseSettings/enterprise.exportMetadata.tpl.html');
  var enterpriseImportIdpTemplatePath = require('ngtemplate-loader?module=Core!./enterpriseSettings/enterprise.importIdp.tpl.html');
  var enterpriseTestSSOTemplatePath = require('ngtemplate-loader?module=Core!./enterpriseSettings/enterprise.testSSO.tpl.html');
  var meetingSettingsMigrateTrialTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-migrate-trial.html');
  var meetingSettingsSiteSetupTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-site-setup.html');
  var meetingSettingsLicenseDistributionTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-license-distribution.html');
  var meetingSettingsSetPartnerAudioTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-audio-partner.html');
  var meetingSettingsSetCCASPTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-ccasp.html');
  var meetingSettingsSetCCAUserTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-cca-user.html');
  var meetingSettingsSummaryTemplatePath = require('ngtemplate-loader?module=Core!./meeting-settings/meeting-summary.html');

  var callSettingsCallPickupCountryTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/serviceHuronCustomerCreate.html');
  var callSettingsSetupLocationTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/locationSetup.html');
  var callSettingsSetupSiteTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/serviceSetup.html');
  var bsftSettingsSetupTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/bsftSetup.html');
  var bsftLicenseAllocationTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/bsftLicenseAllocation.html');
  var bsftNumberSetupTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/bsftNumber.html');
  var bsftAssignNumberTemplatePath = require('ngtemplate-loader?module=Core!./callSettings/bsftAssignNumber.html');

  var careSettingsTemplatePath = require('ngtemplate-loader?module=Core!./careSettings/careSettings.tpl.html');

  var finishProvisionTemplatePath = require('ngtemplate-loader?module=Core!./finish/provision.html');
  var finishDoneTemplatePath = require('ngtemplate-loader?module=Core!./finish/finish.html');

  angular.module('Core')
    .controller('SetupWizardCtrl', SetupWizardCtrl);

  function SetupWizardCtrl($q, $scope, $state, $stateParams, $timeout, Analytics, ApiCacheManagementService, Authinfo, Config, FeatureToggleService, Orgservice, SessionStorage, SetupWizardService, StorageKeys, Notification, CustomerCommonService, RialtoService) {
    var isFirstTimeSetup = _.get($state, 'current.data.firstTimeSetup', false);
    var isITDecouplingFlow = false;
    var shouldRemoveSSOSteps = false;
    var isSharedDevicesOnlyLicense = false;
    var shouldShowMeetingsTab = false;
    var hasPendingCallLicenses = false;
    var hasPendingLicenses = false;
    var supportsHI1484 = false;
    var supportsHI1776 = false;
    $scope.tabs = [];
    $scope.isTelstraCsbEnabled = false;
    $scope.isCSB = Authinfo.isCSB();
    $scope.isCustomerPresent = SetupWizardService.isCustomerPresent();

    // If a partner cross-launches into a customer through the Order Processing flow
    // with a subscriptionId of an active subscription, we navigate the user to overview
    if (isFirstTimeSetup && SetupWizardService.isProvisionedSubscription(SessionStorage.get(StorageKeys.SUBSCRIPTION_ID))) {
      Authinfo.setSetupDone(true);
      var analyticsProperties = {
        subscriptionId: SessionStorage.get(StorageKeys.SUBSCRIPTION_ID),
      };
      Analytics.trackServiceSetupSteps(Analytics.sections.SERVICE_SETUP.eventNames.FORWARDED_TO_OVERVIEW, analyticsProperties);
      return $state.go('overview');
    }

    if (Authinfo.isCustomerAdmin() || Authinfo.isReadOnlyAdmin()) {
      sendAnalytics();
      SetupWizardService.onActingSubscriptionChange(init);
      initToggles().finally(init);
    }

    function initToggles() {
      if (isFirstTimeSetup) {
        shouldRemoveSSOSteps = true;
      }

      var hI1484Promise = FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (_supportsHI1484) {
          supportsHI1484 = _supportsHI1484;
        });

      var hI1776Promise = FeatureToggleService.supports(FeatureToggleService.features.hI1776)
        .then(function (_supportsHI1776) {
          supportsHI1776 = _supportsHI1776;
        });

      var adminOrgUsagePromise = Orgservice.getAdminOrgUsage()
        .then(function (subscriptions) {
          var licenses = _.flatMap(subscriptions, 'licenses');
          var uniqueLicenseTypes = _.uniq(_.map(licenses, 'licenseType'));
          isSharedDevicesOnlyLicense = _.without(uniqueLicenseTypes, Config.licenseTypes.SHARED_DEVICES).length === 0;
        })
        .catch(_.noop);

      var pendingSubscriptionsPromise = SetupWizardService.populatePendingSubscriptions();

      var promises = [
        adminOrgUsagePromise,
        hI1484Promise,
        hI1776Promise,
        pendingSubscriptionsPromise,
      ];
      return $q.all(promises);
    }

    function init() {
      isITDecouplingFlow = SetupWizardService.hasPendingServiceOrder() || SetupWizardService.hasPendingSubscriptionOptions();
      getPendingSubscriptionFlags();
      var tabs = getInitTabs();

      initHybridServicesCaches();
      initPlanReviewTab(tabs);
      initEnterpriseSettingsTab(tabs);
      initMeetingSettingsTab(tabs);
      initCallSettingsTab(tabs);
      initCareTab(tabs);
      initFinishTab(tabs);
      removeTabsWithEmptySteps(tabs);
      $scope.tabs = filterTabsByStateParams(tabs);
    }

    function sendAnalytics() {
      var analyticsProperties = {
        subscriptionId: SetupWizardService.getActingSubscriptionId(),
        view: isFirstTimeSetup ? 'Service Setup' : 'overview: Meeting Settings Modal',
      };

      if (SessionStorage.get(StorageKeys.SUBSCRIPTION_ID) && (SessionStorage.get(StorageKeys.PARTNER_ORG_ID) || SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID))) {
        Analytics.trackServiceSetupSteps(Analytics.sections.SERVICE_SETUP.eventNames.REDIRECTED_INTO_ATLAS_FROM_OPC, analyticsProperties);
      } else if (SessionStorage.get(StorageKeys.PARTNER_ORG_ID) || SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID)) {
        var eventKey = SessionStorage.get(StorageKeys.PARTNER_ORG_ID)
          ? Analytics.sections.SERVICE_SETUP.eventNames.PARTNER_SETUP_OWNORG
          : Analytics.sections.SERVICE_SETUP.eventNames.PARTNER_SETUP_CUSTOMER;
        Analytics.trackServiceSetupSteps(eventKey, analyticsProperties);
      } else {
        Analytics.trackServiceSetupSteps(Analytics.sections.SERVICE_SETUP.eventNames.CUSTOMER_SETUP, analyticsProperties);
      }
    }

    function getPendingSubscriptionFlags() {
      shouldShowMeetingsTab = SetupWizardService.hasPendingWebExMeetingLicenses();
      hasPendingCallLicenses = SetupWizardService.hasPendingCallLicenses();
      hasPendingLicenses = SetupWizardService.hasPendingLicenses();
    }

    function getInitTabs() {
      return [{
        name: 'enterpriseSettings',
        label: 'firstTimeWizard.enterpriseSettings',
        description: 'firstTimeWizard.enterpriseSettingsSub',
        icon: 'icon-settings',
        title: 'firstTimeWizard.enterpriseSettings',
        controller: 'EnterpriseSettingsCtrl as entprCtrl',
        steps: [{
          name: 'enterpriseSipUrl',
          template: enterpriseSetSipDomainTemplatePath,
        }, {
          name: 'init',
          template: enterpriseInitTemplatePath,
        }, {
          name: 'exportMetadata',
          template: enterpriseExportMetadataTemplatePath,
        }, {
          name: 'importIdp',
          template: enterpriseImportIdpTemplatePath,
        }, {
          name: 'testSSO',
          template: enterpriseTestSSOTemplatePath,
        }],
      },
      ];
    }

    function initPlanReviewTab(tabs) {
      var tab = {
        name: 'planReview',
        label: 'firstTimeWizard.planReview',
        description: 'firstTimeWizard.planReviewSub',
        icon: 'icon-plan-review',
        title: 'firstTimeWizard.planReview',
        controller: 'PlanReviewCtrl as planReview',
        steps: [{
          name: 'init',
          template: planReviewInitTemplatePath,
        }],
      };

      if (SetupWizardService.hasPendingSubscriptionOptions()) {
        var step = {
          name: 'select-subscription',
          template: planReviewSelectSubscriptionTemplatePath,
          title: 'firstTimeWizard.selectSubscriptionTitle',
        };
        tab.steps.splice(0, 0, step);
      }

      if (SetupWizardService.hasPendingServiceOrder() || SetupWizardService.hasPendingSubscriptionOptions()) {
        tab.label = 'firstTimeWizard.subscriptionReview';
        tab.title = 'firstTimeWizard.subscriptionReview';
      }

      tabs.splice(0, 0, tab);
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
          template: meetingSettingsMigrateTrialTemplatePath,
        },
        {
          name: 'siteSetup',
          template: meetingSettingsSiteSetupTemplatePath,
        },
        {
          name: 'licenseDistribution',
          template: meetingSettingsLicenseDistributionTemplatePath,
        },
        {
          name: 'setPartnerAudio',
          template: meetingSettingsSetPartnerAudioTemplatePath,
        },
        {
          name: 'setCCASP',
          template: meetingSettingsSetCCASPTemplatePath,
        },
        {
          name: 'setCCAUser',
          template: meetingSettingsSetCCAUserTemplatePath,
        },
        {
          name: 'summary',
          template: meetingSettingsSummaryTemplatePath,
        }],
      };

      if (shouldShowMeetingsTab) {
        if (!SetupWizardService.hasPendingTSPAudioPackage() || SetupWizardService.getActiveTSPAudioPackage() !== undefined) {
          _.remove(meetingTab.steps, { name: 'setPartnerAudio' });
        }
        if (!SetupWizardService.hasPendingCCASPPackage() || SetupWizardService.getActiveCCASPPackage() !== undefined) {
          _.remove(meetingTab.steps, { name: 'setCCASP' });
        }
        if (!SetupWizardService.hasPendingCCAUserPackage() ||
          SetupWizardService.hasPendingCCAUserPartnerName() ||
          !_.isUndefined(SetupWizardService.getActiveCCAUserPackage())) {
          _.remove(meetingTab.steps, { name: 'setCCAUser' });
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
      var pickCountry = {
        name: 'callPickCountry',
        template: callSettingsCallPickupCountryTemplatePath,
      };

      var setupLocation = {
        name: 'setupCallLocation',
        template: callSettingsSetupLocationTemplatePath,
      };

      var setupSite = {
        name: 'setupCallSite',
        template: callSettingsSetupSiteTemplatePath,
      };

      var setupBsft = {
        name: 'setupBsft',
        template: bsftSettingsSetupTemplatePath,
      };

      var bsftLicenseAllocation = {
        name: 'bsftLicenseAllocation',
        template: bsftLicenseAllocationTemplatePath,
      };

      var setupNumberBsft = {
        name: 'setupNumberBsft',
        template: bsftNumberSetupTemplatePath,
      };

      var assignNumberBsft = {
        name: 'assignNumberBsft',
        template: bsftAssignNumberTemplatePath,
      };

      if (showCallSettings()) {
        $q.all({
          customer: $scope.isCustomerPresent,
          bsft: RialtoService.getCustomer(Authinfo.getOrgId()),
        }).then(function (response) {
          if (response.customer && hasPendingCallLicenses) {
            SetupWizardService.activateAndCheckCapacity().catch(function (error) {
              $timeout(function () {
                //   $scope.$emit('wizardNextButtonDisable', true);
              });
              if (error.status === 412) {
                //Error code from Drachma
                Notification.errorWithTrackingId(error, 'firstTimeWizard.error.overCapacity');
              } else {
                Notification.errorWithTrackingId(error, 'firstTimeWizard.error.capacityFail');
              }
              $scope.$emit('wizardNextButtonDisable', true);
            });
          }

          var steps = [];

          if (!response.customer && hasPendingCallLicenses) {
            steps.push(pickCountry);
          } else if (!response.customer && Authinfo.isSquaredUC()) {
            var org = SetupWizardService.getOrg();
            CustomerCommonService.save({}, {
              uuid: org.id,
              name: org.displayName,
              countryCode: org.countryCode,
              servicePackage: 'VOICE_ONLY',
            });
          }

          if (supportsHI1776 || Authinfo.isBroadCloud()) {
            if (!response.bsft.rialtoId) {
              steps.push(setupBsft, bsftLicenseAllocation, setupNumberBsft, assignNumberBsft);
            }
          } else {
            if (supportsHI1484) {
              steps.push(setupLocation);
            } else {
              steps.push(setupSite);
            }
          }

          tabs.splice(1, 0, {
            name: 'serviceSetup',
            required: true,
            label: Authinfo.isBroadCloud() ? 'firstTimeWizard.bsftFlex' : 'firstTimeWizard.callSettings',
            description: 'firstTimeWizard.serviceSetupSub',
            icon: 'icon-calls',
            title: Authinfo.isBroadCloud() ? 'firstTimeWizard.bsftFlex' : 'firstTimeWizard.unifiedCommunication',
            controllerAs: '$ctrl',
            steps: steps,
          });
        });
      }
    }

    function showCallSettings() {
      if (hasPendingCallLicenses) {
        return true;
      }

      var currentSubscription = SetupWizardService.getActingPendingSubscriptionOptionSelection();

      return _.some(Authinfo.getLicenses(), function (license) {
        return (license.licenseType === Config.licenseTypes.COMMUNICATION || license.licenseType === Config.licenseTypes.SHARED_DEVICES)
          && (_.isUndefined(currentSubscription) || license.billingServiceId === currentSubscription.value);
      });
    }

    function initCareTab(tabs) {
      /* If in future, Care settings becomes part of the new orders flow (IT Decoupling)
      the case where hasPendingCareLicenses && isITDecouplingFlow */
      if (Authinfo.isCare() && !isITDecouplingFlow) {
        var careTab = {
          name: 'careSettings',
          label: 'firstTimeWizard.careSettings',
          description: 'firstTimeWizard.careSettingsSub',
          icon: 'icon-headset',
          title: 'firstTimeWizard.careSettings',
          controller: 'CareSettingsCtrl as careSettings',
          steps: [{
            name: 'csonboard',
            template: careSettingsTemplatePath,
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

    function initFinishTab(tabs) {
      if (!Authinfo.isSetupDone()) {
        var tab = {
          name: 'finish',
          label: 'firstTimeWizard.provisionAndBeginBilling',
          description: 'firstTimeWizard.finishSub',
          icon: 'icon-check',
          title: 'firstTimeWizard.provisionAndBeginBilling',
          controller: 'WizardFinishCtrl',
          steps: [{
            name: 'provision',
            template: finishProvisionTemplatePath,
          }, {
            name: 'done',
            template: finishDoneTemplatePath,
          }],
        };

        if (!hasPendingLicenses) {
          tab.label = 'firstTimeWizard.finish';
          tab.title = 'firstTimeWizard.getStarted';
          _.remove(tab.steps, { name: 'provision' });
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

      // Show Subscription selection step if user is setting up WebEx meetings
      if ($stateParams.currentTab === 'meetingSettings') {
        var planReviewTab = _.find(tabs, { name: 'planReview' });
        filteredTabs.unshift(planReviewTab);
      }

      return filteredTabs;
    }

    function initHybridServicesCaches() {
      if (Authinfo.isCustomerLaunchedFromPartner()) {
        ApiCacheManagementService.invalidateHybridServicesCaches();
      }
    }
  }
})();
