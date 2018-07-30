(function () {
  'use strict';

  var OfferName = require('modules/core/shared/offer-name').OfferName;

  angular
    .module('Core')
    .controller('PlanReviewCtrl', PlanReviewCtrl);

  /* @ngInject */
  function PlanReviewCtrl($state, $translate, Analytics, Authinfo, Config, FeatureToggleService, SetupWizardService, TrialService, WebExUtilsFact) {
    var vm = this;
    var TRIAL = 'Trial';

    vm.isCiscoBC = false;

    var classes = {
      userService: 'user-service-',
      hasRoomSys: 'has-room-systems',
    };

    var view = {
      serviceSetup: 'Service Setup',
      meetingSettingsModal: 'overview: Meeting Settings Modal',
    };

    vm.messagingServices = {
      isNewTrial: false,
      services: [],
    };

    vm.confServices = {
      isNewTrial: false,
      services: [],
    };

    vm.commServices = {
      isNewTrial: false,
      services: [],
    };

    vm.careServices = {
      isNewTrial: false,
      services: Authinfo.getCareServices() || [],
    };

    vm.cmrServices = {
      isNewTrial: false,
      services: [],
    };

    vm.roomServices = {
      isNewTrial: false,
      services: [],
    };

    vm.roomSystemsCount = 0;
    vm.trialId = '';
    vm.trial = {};
    vm.trialExists = false;
    vm.trialDaysRemaining = 0;
    vm.trialUsedPercentage = 0;
    vm.isInitialized = false; // invert the logic and initialize to false so the template doesn't flicker before spinner
    vm.showPendingView = false;
    vm.getUserServiceRowClass = getUserServiceRowClass;
    vm._helpers = {
      maxServiceRows: maxServiceRows,
    };

    vm.isCareEnabled = false;

    vm.hasExistingLicenses = Authinfo.getLicenses().length;
    vm.getNamedLabel = function (label) {
      switch (label) {
        case Config.offerCodes.CDC:
          return $translate.instant('onboardModal.paidCDC');
        case Config.offerCodes.CVC:
          return $translate.instant('onboardModal.paidCVC');
        default:
          return '';
      }
    };

    //TODO this function has to be removed when atlas-care-trials feature is removed
    vm.getGridColumnClassName = function () {
      return vm.isCareEnabled ? 'small-3' : 'small-4';
    };

    vm.isSharedMeetingsLicense = function (service) {
      return (_.toLower(_.get(service, 'license.licenseModel', '')) === Config.licenseModel.cloudSharedMeeting) || (_.toLower(_.get(service, 'licenseModel', '')) === Config.licenseModel.cloudSharedMeeting);
    };

    vm.determineLicenseType = function (service) {
      return vm.isSharedMeetingsLicense(service) ? $translate.instant('firstTimeWizard.sharedLicenses') : $translate.instant('firstTimeWizard.namedLicenses');
    };

    vm.generateLicenseTooltip = function (service) {
      return '<div class="license-tooltip-html">' + vm.generateLicenseTranslation(service) + '</div>';
    };

    vm.generateLicenseTranslation = function (service) {
      return vm.isSharedMeetingsLicense(service) ? $translate.instant('firstTimeWizard.sharedLicenseTooltip') : $translate.instant('firstTimeWizard.namedLicenseTooltip');
    };

    init();

    function setActingSubscription(option) {
      SetupWizardService.setActingSubscriptionOption(option);
      fetchPendingSubscriptionInfo();
      var analyticsProperties = {
        subscriptionId: _.get(option, 'value'),
        view: _.get($state, 'current.data.firstTimeSetup') ? view.serviceSetup : view.meetingSettingsModal,
      };
      Analytics.trackServiceSetupSteps(Analytics.sections.SERVICE_SETUP.eventNames.SUBSCRIPTION_SELECT, analyticsProperties);
    }

    function fetchPendingSubscriptionInfo() {
      var audioLicense = SetupWizardService.getPendingAudioLicense();
      var meetingLicenses = SetupWizardService.getPendingMeetingLicenses();

      if (!_.isUndefined(audioLicense)) {
        meetingLicenses.push(audioLicense);
      }

      // TODO update this logic when Room licenses are implemented.
      vm.pendingLicenses = [
        {
          title: $translate.instant('firstTimeWizard.meeting'),
          icon: 'icon-circle-group',
          licenses: meetingLicenses,
        },
        {
          title: $translate.instant('firstTimeWizard.calling'),
          icon: 'icon-circle-call',
          licenses: SetupWizardService.getPendingCallLicenses(),
        },
        {
          title: $translate.instant('firstTimeWizard.messaging'),
          icon: 'icon-circle-message',
          licenses: SetupWizardService.getPendingMessageLicenses(),
        },
        {
          title: $translate.instant('firstTimeWizard.care'),
          icon: 'icon-circle-contact-centre',
          licenses: SetupWizardService.getPendingCareLicenses(),
        },
      ];

      vm.hasPendingLicenses = _.some(vm.pendingLicenses, function (licenseMeta) {
        return !_.isEmpty(licenseMeta.licenses);
      });

      if (vm.hasPendingLicenses) {
        vm.pendingLicenses = _.reject(vm.pendingLicenses, function (licenseMeta) {
          return _.isEmpty(licenseMeta.licenses);
        });
        _.forEach(vm.pendingLicenses, function (licenseMeta) {
          getPendingLicenseDisplayValues(licenseMeta);
        });
        vm.pendingLicenses = _.chunk(vm.pendingLicenses, 3);
      }

      vm.showPendingView = vm.hasPendingLicenses;
      vm.orderDetails = SetupWizardService.getOrderDetails();
    }

    function getUserServiceRowClass(hasRoomSystem) {
      //determine how many vertical entrees there is going to be
      var returnClass = (hasRoomSystem) ? classes.hasRoomSys + ' ' + classes.userService : classes.userService;
      var serviceRows = vm._helpers.maxServiceRows();
      return returnClass + serviceRows;
    }

    function maxServiceRows() {
      var confLength = _.get(vm.confServices, 'services.length', 0) + _.get(vm.cmrServices, 'services.length', 0);
      return _.max([confLength, vm.messagingServices.services.length, vm.commServices.services.length]);
    }

    function getPendingLicenseDisplayValues(licenseMeta) {
      _.forEach(licenseMeta.licenses, function (license) {
        var translatedNameString = 'subscriptions.licenseTypes.' + license.offerName;
        license.displayName = $translate.instant(translatedNameString);
        if (license.capacity && license.offerName !== 'CF') {
          license.displayName += ' ' + license.capacity;
        }
      });
    }

    function init() {
      // pending subscription initialization
      vm.setActingSubscription = setActingSubscription;
      if (SetupWizardService.hasPendingSubscriptionOptions()) {
        vm.pendingSubscriptionOptions = SetupWizardService.getPendingSubscriptionOptions();
        vm.selectedSubscription = SetupWizardService.getActingPendingSubscriptionOptionSelection();
        if (!SetupWizardService.hasPendingServiceOrder()) {
          setActingSubscription(vm.selectedSubscription);
        }
      }
      if (SetupWizardService.hasPendingServiceOrder()) {
        fetchPendingSubscriptionInfo();
      }

      vm.isCareEnabled = Authinfo.isCare();

      vm.messagingServices.services = Authinfo.getMessageServices() || [];
      _.forEach(vm.messagingServices.services, function (service) {
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;

          if (service.license.status === Config.licenseStatus.PENDING) {
            vm.messagingServices.isNewTrial = true;
          }
        }
      });

      vm.confServices.services = Authinfo.getConferenceServices() || [];
      _.forEach(vm.confServices.services, function (service) {
        var siteUrl = service.license.siteUrl;
        var isCISite = WebExUtilsFact.isCIEnabledSite(siteUrl);

        service.license.isCI = isCISite;

        if (service.label.indexOf('Meeting Center') != -1) {
          service.label = $translate.instant('onboardModal.meetingCenter') + ' ' + service.license.capacity;
          service.license.siteAdminUrl = WebExUtilsFact.getSiteAdminUrl(siteUrl);
        }
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;
          if (service.license.status === Config.licenseStatus.PENDING) {
            vm.confServices.isNewTrial = true;
          }
        }
      });

      vm.hasAdvancedLicenses = function () {
        return _.some(vm.confServices.services, function (service) {
          return _.has(service, 'license.siteUrl');
        });
      };

      vm.hasBasicLicenses = function () {
        return _.some(vm.confServices.services, function (service) {
          return _.get(service, 'license.offerName') === 'CF';
        });
      };

      /* TODO: Refactor this functions into MultipleSubscriptions Controller */
      vm.selectedSubscriptionHasBasicLicenses = function (subscriptionId) {
        if (subscriptionId && subscriptionId !== Config.subscriptionState.trial) {
          return _.some(vm.confServices.services, function (service) {
            if (_.get(service, 'license.billingServiceId') === subscriptionId) {
              return !_.has(service, 'license.siteUrl');
            }
          });
        } else {
          return vm.hasBasicLicenses();
        }
      };

      /* TODO: Refactor this functions into MultipleSubscriptions Controller */
      vm.selectedSubscriptionHasAdvancedLicenses = function (subscriptionId) {
        if (subscriptionId && subscriptionId !== Config.subscriptionState.trial) {
          return _.some(vm.confServices.services, function (service) {
            if (_.get(service, 'license.billingServiceId') === subscriptionId) {
              return _.has(service, 'license.siteUrl');
            }
          });
        } else {
          return vm.hasAdvancedLicenses();
        }
      };

      FeatureToggleService.supports(FeatureToggleService.features.hI1776).then(function (results) {
        vm.isCiscoBC = results || Authinfo.isBroadCloud();
      });

      //sorting and reversing communication license so that standand license comes first in display.
      vm.commServices.services = _.reverse(_.sortBy(Authinfo.getCommunicationServices(), ['name'])) || [];
      _.forEach(vm.commServices.services, function (service) {
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;

          if (service.license.status === Config.licenseStatus.PENDING) {
            vm.commServices.isNewTrial = true;
          }
        }
      });

      var isNewCareTrial = _.chain(vm.careServices.services)
        .map('license')
        .filter(function (license) {
          if (license.isTrial) {
            vm.trialExists = true;
            vm.trialId = license.trialId;
            return true;
          }
          return false;
        }).filter(function (license) {
          return license.status === Config.licenseStatus.PENDING;
        })
        .value();

      if (isNewCareTrial.length) {
        vm.careServices.isNewTrial = true;
      }

      vm.roomServices.services = Authinfo.getLicenses() || [];
      _.forEach(vm.roomServices.services, function (service) {
        if (service.licenseType === Config.licenseTypes.SHARED_DEVICES) {
          vm.roomSystemsCount += service.volume;
          if (service.isTrial) {
            vm.trialExists = true;
            vm.trialId = service.trialId;

            if (service.status === Config.licenseStatus.PENDING) {
              vm.roomServices.isNewTrial = true;
            }
          }
        }
      });

      //check if the trial exists
      if (vm.trialExists) {
        TrialService.getTrial(vm.trialId).then(function (trial) {
          populateTrialData(trial);
        }).finally(function () {
          vm.isInitialized = true;
        });
      } else {
        vm.isInitialized = true;
      }

      vm.cmrServices.services = Authinfo.getCmrServices();

      vm.sites = {};
      _.forEach(vm.confServices.services, function (service) {
        if (_.has(service, 'license.siteUrl') && !_.isUndefined(service.license.siteUrl)) {
          if (!vm.sites[service.license.siteUrl]) {
            vm.sites[service.license.siteUrl] = [];
          }
          vm.sites[service.license.siteUrl].push(service);
        }
      });

      vm.advancedMeetings = {};
      _.forEach(vm.sites, function (services) {
        _.forEach(services, function (service) {
          var offerCode = _.get(service, 'license.offerName');
          // check for advanced meetings based on billing service id first, license type second to catch trials
          if (_.has(service, 'license.billingServiceId') && !_.isUndefined(service.license.billingServiceId)) {
            if (_.isUndefined(vm.advancedMeetings[service.license.billingServiceId])) {
              vm.advancedMeetings[service.license.billingServiceId] = [];
            }
            vm.advancedMeetings[service.license.billingServiceId].push(service);
          } else if (offerCode === OfferName.EE || offerCode === OfferName.MC || offerCode === OfferName.TC || offerCode === OfferName.SC || offerCode === OfferName.EC) {
            if (_.isUndefined(vm.advancedMeetings[TRIAL])) {
              vm.advancedMeetings[TRIAL] = [];
            }
            vm.advancedMeetings[TRIAL].push(service);
          }
        });
      });

      if (Object.prototype.toString.call(vm.cmrServices.services) == '[object Array]') {
        _.forEach(vm.cmrServices.services, function (service) {
          if (service.license) {
            if (service.license.siteUrl) {
              if (!vm.sites[service.license.siteUrl]) {
                vm.sites[service.license.siteUrl] = [];
              }
              service.label = $translate.instant('onboardModal.cmr') + ' ' + service.license.capacity;
              vm.sites[service.license.siteUrl].push(service);
            }
          }
        });
      } else {
        var cmrService = vm.cmrServices.services;
        if (cmrService && cmrService.license) {
          if (!vm.sites[cmrService.license.siteUrl]) {
            vm.sites[cmrService.license.siteUrl] = [];
          }
          cmrService.label = $translate.instant('onboardModal.cmr') + ' ' + cmrService.license.capacity;
          vm.sites[cmrService.license.siteUrl].push(cmrService);
        }
      }
    }
    /////////////////

    function populateTrialData(trial) {
      vm.trial = trial;
      var now = moment().startOf('day');
      var start = moment(vm.trial.startDate).startOf('day');
      var daysUsed = moment(now).diff(start, 'days');
      var daysLeft = vm.trial.trialPeriod - daysUsed;
      vm.trialDaysRemaining = daysLeft < 0 ? 0 : daysLeft;
      vm.trialUsedPercentage = Math.round((daysUsed / vm.trial.trialPeriod) * 100);
    }
  }
})();
