require('./_overview.scss');
var SsoCertExpNotificationService = require('modules/core/overview/notifications/ssoCertificateExpirationNotification.service').SsoCertificateExpirationNotificationService;
var OfferName = require('modules/core/shared/offer-name').OfferName;
var OverviewEvent = require('./overview.keys').OverviewEvent;

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl(
    $location,
    $q,
    $rootScope,
    $scope,
    $state,
    $timeout,
    Authinfo,
    AutoAssignTemplateService,
    CardUtils,
    CloudConnectorService,
    Config,
    DirConnectorUpgradeNotificationService,
    EvaService,
    FeatureToggleService,
    HealthService,
    HybridServicesClusterService,
    HybridServicesFlagService,
    HybridServicesUtilsService,
    LearnMoreBannerService,
    LinkedSitesService,
    Log,
    Notification,
    Orgservice,
    OverviewCardFactory,
    OverviewNotificationFactory,
    PrivacyDataSheetsNotificationService,
    PrivateTrunkService,
    ProPackService,
    PstnService,
    ServiceDescriptorService,
    SetupWizardService,
    SsoCertificateExpirationNotificationService,
    SsoCertificateService,
    SubscriptionWithUnsyncedLicensesNotificationService,
    SunlightReportService,
    SunlightUtilitiesService,
    TrialService,
    UrlConfig,
    WebExSiteService,
    WifiProximityService,
    SparkAssistantService
  ) {
    var vm = this;
    var PSTN_TOS_ACCEPT = require('modules/huron/pstn/pstnTermsOfService').PSTN_TOS_ACCEPT;
    var PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;

    var proPackPurchased = false;

    vm.loadingSubscriptions = true;
    vm.isCSB = Authinfo.isCSB();
    vm.isDeviceManagement = Authinfo.isDeviceMgmt();
    vm.orgData = null;

    var hybridCallHighAvailability = 'atlas.notification.squared-fusion-uc-high-availability.acknowledged';
    var allHybridCalendarsNotification = 'atlas.notification.squared-fusion-all-calendars.acknowledged';

    vm.cards = [
      OverviewCardFactory.getMessageCard(),
      OverviewCardFactory.getMeetingCard(),
      OverviewCardFactory.getCallCard(),
      OverviewCardFactory.createCareCard(),
      OverviewCardFactory.getRoomsCard(),
      OverviewCardFactory.createHybridServicesCard(),
      OverviewCardFactory.createUsersCard(),
    ];

    vm.notifications = [];
    vm.pushNotification = pushNotification;
    vm.pstnToSNotification = null;
    vm.esaDisclaimerNotification = null;
    vm.trialDaysLeft = undefined;
    vm.isEnterpriseCustomer = isEnterpriseCustomer;
    vm.dismissNotification = dismissNotification;
    vm.notificationComparator = notificationComparator;
    vm.ftEnterpriseTrunking = false;
    vm.showUserTaskManagerModal = showUserTaskManagerModal;
    var updateSsoCertificateNow = false;

    ////////////////////////////////
    // Remove the updateSsoCertificateNow search param if present,
    // because we only want to show SSO Certificate Update dialog
    // the very first time when going into the Overview page.
    if (_.toLower($location.search().updateSsoCertificateNow) === 'true') {
      $location.search('updateSsoCertificateNow', null);
      updateSsoCertificateNow = true;
    }

    $q.all({
      enabledNotPurchased: ProPackService.hasProPackEnabledAndNotPurchased(),
      purchased: ProPackService.hasProPackPurchased(),
      broadsoft: FeatureToggleService.supports(FeatureToggleService.features.hI1776),
    }).then(function (response) {
      proPackPurchased = response.purchased;

      if (response.enabledNotPurchased && isEnterpriseCustomer()) {
        $scope.$watch(function () {
          return LearnMoreBannerService.isElementVisible(LearnMoreBannerService.OVERVIEW_LOCATION);
        }, function (visible) {
          vm.showLearnMoreNotification = !visible;
        });
      }

      if (response.broadsoft) {
        vm.cards.splice(2, 0, OverviewCardFactory.createBroadsoftCard());
      }

      init();
    });

    var notificationOrder = [
      'alert',
      'todo',
      'info',
      'new',
    ];

    function isEnterpriseCustomer() {
      return Authinfo.isEnterpriseCustomer();
    }

    // used to sort notifications in a specific order
    function notificationComparator(a, b) {
      if (a.type === 'number') {
        return b.value - a.value;
      }

      var v1 = _.toLower(_.last(_.split(a.value, '.')));
      var v2 = _.toLower(_.last(_.split(b.value, '.')));
      if (_.isEqual(v1, v2)) {
        return 0;
      } else {
        return (_.indexOf(notificationOrder, v1) < _.indexOf(notificationOrder, v2)) ? -1 : 1;
      }
    }

    // pushNotification -
    // zOrder sorts within a particular badge type (e.g. within new notifications).
    // the higher the zOrder, the higher the notification is placed in the list.  A zero value is default.
    //
    function pushNotification(notification, zOrder) {
      // Set the notification's zOrder if one is specified or does not exist
      notification.zOrder = zOrder || notification.zOrder || 0;
      vm.notifications.push(notification);

      // for smaller screens where the notifications are on top, the layout needs to resize after the notifications are loaded
      CardUtils.resize(0, '.fourth.cs-card-layout');
    }

    function init() {
      getHealthStatus();
      findAnyUrgentUpgradeInHybridServices();
      removeCardUserTitle();
      getWifiProximityOptInStatus();
      if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
        pushNotification(OverviewNotificationFactory.createSetupNotification());
      }

      LinkedSitesService.linkedSitesNotConfigured().then(function (showNotification) {
        if (showNotification === true) {
          pushNotification(OverviewNotificationFactory.createLinkedSitesNotification($state));
        }
      });

      var hybridServiceNotificationFlags = _.chain([
        Config.entitlements.fusion_cal,
        Config.entitlements.fusion_gcal,
        Config.entitlements.fusion_uc,
        Config.entitlements.fusion_ec,
        Config.entitlements.mediafusion,
        Config.entitlements.hds,
        Config.entitlements.imp,
      ])
        .filter(Authinfo.isEntitled)
        .map(HybridServicesUtilsService.getAckFlagForHybridServiceId)
        .value();
      hybridServiceNotificationFlags.push(hybridCallHighAvailability);
      hybridServiceNotificationFlags.push(allHybridCalendarsNotification);

      HybridServicesFlagService
        .readFlags(hybridServiceNotificationFlags)
        .then(function (flags) {
          _.forEach(flags, function (flag) {
            if (!flag.raised) {
              if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_cal)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasOffice365Support)
                  .then(function (supported) {
                    if (!supported) {
                      pushNotification(OverviewNotificationFactory.createCalendarNotification());
                    }
                  });
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_gcal)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasOffice365Support)
                  .then(function (supported) {
                    if (!supported) {
                      pushNotification(OverviewNotificationFactory.createGoogleCalendarNotification($state, CloudConnectorService, HybridServicesFlagService, HybridServicesUtilsService));
                    }
                  });
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_uc)) {
                pushNotification(OverviewNotificationFactory.createCallAwareNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_ec)) {
                pushNotification(OverviewNotificationFactory.createCallConnectNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.mediafusion)) {
                pushNotification(OverviewNotificationFactory.createHybridMediaNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.hds) && proPackPurchased) {
                pushNotification(OverviewNotificationFactory.createHybridDataSecurityNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.imp)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp)
                  .then(function (supported) {
                    if (supported) {
                      pushNotification(OverviewNotificationFactory.createHybridMessagingNotification($state, HybridServicesFlagService, HybridServicesUtilsService));
                    }
                  });
              } else if (flag.name === hybridCallHighAvailability && Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
                ServiceDescriptorService.isServiceEnabled('squared-fusion-uc')
                  .then(function (isSetup) {
                    if (isSetup) {
                      return HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
                        .then(function (serviceHasHA) {
                          if (!serviceHasHA) {
                            pushNotification(OverviewNotificationFactory.createCallServiceHighAvailability());
                          }
                        });
                    }
                  });
              } else if (flag.name === allHybridCalendarsNotification && Authinfo.isEntitled(Config.entitlements.fusion_cal) && Authinfo.isEntitled(Config.entitlements.fusion_gcal)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasOffice365Support)
                  .then(function (supported) {
                    if (supported) {
                      OverviewNotificationFactory.createAllHybridCalendarsNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
                        .then(function (allHybridCalendarsNotification) {
                          pushNotification(allHybridCalendarsNotification);
                        });
                    }
                  });
              }
            }
          });
        })
        .catch(function () {
          Log.error('Error in GET service acknowledged status');
        });

      var params = {
        basicInfo: true,
        disableCache: true,
      };

      $q.all({
        orgDetails: Orgservice.getOrg(_.noop, Authinfo.getOrgId(), params),
        featureToggle: FeatureToggleService.supports(FeatureToggleService.features.hybridCare),
        isAtlasSsoCertificateUpdateToggled: FeatureToggleService.atlasSsoCertificateUpdateGetStatus(),
        isAtlasDirectoryConnectorUpgradeStopNotificationToggled: FeatureToggleService.atlasDirectoryConnectorUpgradeStopNotificationGetStatus(),
        pt: PrivateTrunkService.getPrivateTrunk(),
        ept: ServiceDescriptorService.getServiceStatus('ept'),
      }).then(function (response) {
        vm.orgData = response.orgDetails.data;
        vm.careToggle = response.featureToggle;
        vm.pt = response.pt.resources.length !== 0;
        vm.ept = response.ept.state !== 'unknown';

        getTOSStatus();
        getEsaDisclaimerStatus();

        if (!_.get(vm.orgData, 'orgSettings.sipCloudDomain')) {
          pushNotification(OverviewNotificationFactory.createCloudSipUriNotification());
        }
        if (vm.isDeviceManagement && _.isUndefined(_.get(vm.orgData, 'orgSettings.allowCrashLogUpload'))) {
          pushNotification(OverviewNotificationFactory.createCrashLogNotification());
        }
        if (Authinfo.isCare() || Authinfo.isCareVoice()) {
          var hasMessage = Authinfo.isMessageEntitled();
          var hasCall = Authinfo.hasCallLicense();
          if (!hasMessage && !hasCall) {
            pushNotification(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseMsgAndCallMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasMessage) {
            pushNotification(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseMsgMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasCall && !vm.careToggle) {
            pushNotification(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseCallMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasCall && (!vm.pt && !vm.ept) && vm.careToggle) {
            pushNotification(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseCallMissingTextToggle', 'careChatTpl.learnMoreLink', FeatureToggleService));
          }
        }

        checkForUnsyncedSubscriptionLicenses();
        checkForSsoCertificateExpiration(response.isAtlasSsoCertificateUpdateToggled);
        checkForDirConnectorUpgrade(response.isAtlasDirectoryConnectorUpgradeStopNotificationToggled);
      }).catch(function (response) {
        Notification.errorWithTrackingId(response, 'firstTimeWizard.sparkDomainManagementServiceErrorMessage');
      });

      Orgservice.getInternallyManagedSubscriptions()
        .then(function (subscriptions) {
          // timeout to prevent event from firing before page finishes loading
          $timeout(function () {
            $rootScope.$emit(OverviewEvent.SUBSCRIPTIONS_LOADED_EVENT, subscriptions);
            vm.loadingSubscriptions = false;
          });

          var activeLicenses = _.filter(_.flatMap(subscriptions, 'licenses'), ['status', Config.licenseStatus.ACTIVE]);
          var sharedDeviceLicenses = _.filter(activeLicenses, ['offerName', OfferName.SD]);
          var sharedDevicesUsage = _.sumBy(sharedDeviceLicenses, 'usage');
          var showSharedDevicesNotification = sharedDeviceLicenses.length > 0 && sharedDevicesUsage === 0;
          var sparkBoardLicenses = _.filter(activeLicenses, ['offerName', OfferName.SB]);
          var sparkBoardUsage = _.sumBy(sparkBoardLicenses, 'usage');
          var showSparkBoardNotification = sparkBoardLicenses.length > 0 && sparkBoardUsage === 0;

          if (showSharedDevicesNotification && showSparkBoardNotification) {
            pushNotification(OverviewNotificationFactory.createDevicesNotification('homePage.setUpDevices'));
          } else if (showSparkBoardNotification) {
            pushNotification(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSparkBoardDevices'));
          } else if (showSharedDevicesNotification) {
            pushNotification(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSharedDevices'));
          }
        }).catch(function () {
          vm.loadingSubscriptions = false;
        });

      FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking).then(function (result) {
        vm.ftEnterpriseTrunking = result;
        getEsaDisclaimerStatus();
      });

      AutoAssignTemplateService.hasDefaultTemplate().then(function (hasDefaultTemplate) {
        if (!hasDefaultTemplate) {
          pushNotification(OverviewNotificationFactory.createAutoAssignNotification());
        }
      });

      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        vm.trialDaysLeft = daysLeft;
      });

      FeatureToggleService.atlasSparkAssistantGetStatus().then(function (toggle) {
        if (toggle) {
          SparkAssistantService.getSpeechServiceOptIn().then(function (response) {
            if (_.get(response, 'activationStatus').toUpperCase() === 'ENABLED') {
              pushNotification(OverviewNotificationFactory.createSparkAssistantNotification());
            }
          });
        }
      });

      // $TODO - remove notification (and all related code) after 8/25/2018
      pushNotification(PrivacyDataSheetsNotificationService.createNotification(), 100);
    }

    // Show Warning if there is an EVA that's missing default expert space
    if (Authinfo.isCare() && Authinfo.isCustomerAdmin()) {
      FeatureToggleService.supports(FeatureToggleService.features.atlasExpertVirtualAssistantEnable)
        .then(function (isEnabled) {
          if (isEnabled) {
            EvaService.getMissingDefaultSpaceEva()
              .then(function (eva) {
                if (!_.isEmpty(eva)) {
                  var linkText = 'homePage.goToEditNow';
                  var text = 'homePage.evaMissingDefaultSpace';
                  var owner = '';
                  var access = EvaService.canIEditThisEva(eva);
                  if (!access) {
                    linkText = '';
                    text = 'homePage.evaMissingDefaultSpaceAndNoPermission';
                    owner = EvaService.getEvaOwner(eva);
                  }
                  pushNotification(OverviewNotificationFactory.createEvaMissingDefaultSpaceNotification($state, eva, linkText, text, owner));
                }
              });
          }
        });
    }

    if (Authinfo.isCare() && Authinfo.isCustomerAdmin()) {
      SunlightUtilitiesService.isCareSetup().then(function (isOrgOnboarded) {
        if (!isOrgOnboarded && SunlightUtilitiesService.showSetUpCareNotification()) {
          pushNotification(OverviewNotificationFactory.createCareNotSetupNotification());
        }
      });
    }

    function checkForUnsyncedSubscriptionLicenses() {
      WebExSiteService.findSubscriptionsWithUnsyncedLicenses().then(function (results) {
        _.forEach(results, function (unsyncedSubscription) {
          pushNotification(SubscriptionWithUnsyncedLicensesNotificationService.createNotification(unsyncedSubscription));
        });
      });
    }

    function checkForSsoCertificateExpiration(isAtlasSsoCertificateUpdateToggled) {
      var ssoEnabled = _.get(vm.orgData, 'ssoEnabled');

      if (!ssoEnabled || !isAtlasSsoCertificateUpdateToggled) {
        return;
      }

      SsoCertificateService.getOrgCertificates()
        .then(function (certificates) {
          var primaryCert = _.find(certificates, { primary: true });
          if (_.isUndefined(primaryCert)) {
            return;
          }

          var today = moment();
          var certificateExpirationDate = moment(_.get(primaryCert, 'expirationDate'));
          var daysDiff = certificateExpirationDate.diff(today, 'days');
          if (daysDiff <= SsoCertExpNotificationService.CERTIFICATE_EXPIRATION_DAYS) {
            pushNotification(SsoCertificateExpirationNotificationService.createNotification(daysDiff));
            if (updateSsoCertificateNow) {
              $state.go('sso-certificate.sso-certificate-check');
            }
          }
        });
    }

    function checkForDirConnectorUpgrade(isAtlasDirectoryConnectorUpgradeStopNotificationToggled) {
      if (!isAtlasDirectoryConnectorUpgradeStopNotificationToggled) {
        pushNotification(DirConnectorUpgradeNotificationService.createNotification());
      }
    }

    function getTOSStatus() {
      //Don't allow the Parner to accept ToS for the customer
      if (Authinfo.isCustomerLaunchedFromPartner()) {
        return;
      }
      if (vm.orgData !== null) {
        PstnService.getCustomerV2(vm.orgData.id).then(function (customer) {
          if (customer.trial) {
            PstnService.getCustomerTrialV2(vm.orgData.id).then(function (trial) {
              if (!_.has(trial, 'acceptedDate')) {
                vm.pstnToSNotification = OverviewNotificationFactory.createPstnTermsOfServiceNotification();
                pushNotification(vm.pstnToSNotification);
                $scope.$on(PSTN_TOS_ACCEPT, onPstnToSAccept);
              }
            });
          }
        });
      }
    }

    function onPstnToSAccept() {
      if (vm.pstnToSNotification !== null) {
        dismissNotification(vm.pstnToSNotification);
      }
    }

    function getEsaDisclaimerStatus() {
      if (Authinfo.isCustomerLaunchedFromPartner() || !vm.ftEnterpriseTrunking) {
        return;
      }
      if (vm.orgData !== null) {
        PstnService.isSwivelCustomerAndEsaUnsigned(vm.orgData.id).then(function (result) {
          if (result) {
            vm.esaDisclaimerNotification = OverviewNotificationFactory.createEsaDisclaimerNotification();
            pushNotification(vm.esaDisclaimerNotification);
            $scope.$on(PSTN_ESA_DISCLAIMER_ACCEPT, onPstnEsaDisclaimerAccept);
          }
        });
      }
    }

    function getHealthStatus() {
      HealthService.getHealthCheck().then(function (healthData) {
        $timeout(function () {
          // timeout to prevent event from firing before page finishes loading
          $rootScope.$emit(OverviewEvent.HEALTH_STATUS_LOADED_EVENT, healthData);

          // TODO: this is left in for now for the Care card, which needs to be updated to a component
          forwardEvent('healthStatusUpdatedHandler', healthData);
        });
      });
    }

    function onPstnEsaDisclaimerAccept() {
      if (vm.esaDisclaimerNotification !== null) {
        dismissNotification(vm.esaDisclaimerNotification);
      }
    }

    function findAnyUrgentUpgradeInHybridServices() {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          var connectorsToTest = ['c_mgmt', 'c_cal', 'c_ucmc', 'c_imp'];
          connectorsToTest.forEach(function (connectorType) {
            var shouldDisplayNotification = _.some(clusters, function (cluster) {
              var urgentUpgrade = _.find(cluster.provisioning, function (p) {
                return p.connectorType === connectorType && p.availablePackageIsUrgent;
              });
              if (urgentUpgrade) {
                return _.some(cluster.connectors, function (connector) {
                  return connector.connectorType === connectorType && connector.runningVersion !== urgentUpgrade.availableVersion;
                });
              }
              return false;
            });
            if (shouldDisplayNotification) {
              pushNotification(OverviewNotificationFactory.createUrgentUpgradeNotification(connectorType));
            }
          });
        });
    }

    function getWifiProximityOptInStatus() {
      if (Authinfo.isCustomerLaunchedFromPartner() || !(Authinfo.isCustomerAdmin() || Authinfo.isReadOnlyAdmin())) {
        return;
      }
      FeatureToggleService.csdmProximityOptInGetStatus().then(function (optInToggle) {
        if (!optInToggle) {
          return;
        }
        WifiProximityService.getOptInStatusEverSet().then(function (optInIsEverSet) {
          if (!optInIsEverSet) {
            vm.notifications.push(OverviewNotificationFactory.createWifiProximityOptInNotification());
          }
        });
      });
    }

    function removeCardUserTitle() {
      if (vm.isCSB) {
        _.remove(vm.cards, {
          name: 'overview.cards.users.title',
        });
      }
    }

    function dismissNotification(notification) {
      vm.notifications = _.reject(vm.notifications, {
        name: notification.name,
      });
      notification.dismiss();
    }

    function forwardEvent(handlerName) {
      var eventArgs = [].slice.call(arguments, 1);
      _.each(vm.cards, function (card) {
        if (typeof (card[handlerName]) === 'function') {
          card[handlerName].apply(card, eventArgs);
        }
      });
    }

    function initializeProvisioningEventHandler() {
      if (SetupWizardService.hasPendingCCWSubscriptions()) {
        var pendingServiceOrderUUID = SetupWizardService.getActingSubscriptionServiceOrderUUID();

        SetupWizardService.getPendingOrderStatusDetails(pendingServiceOrderUUID).then(function (productProvStatus) {
          forwardEvent('provisioningEventHandler', productProvStatus);
          $rootScope.$emit(OverviewEvent.MEETING_SETTINGS_PROVISIONING_STATUS, productProvStatus);
        });
      }
    }

    function showUserTaskManagerModal() {
      $state.go('users.csv.task-manager');
    }

    forwardEvent('licenseEventHandler', Authinfo.getLicenses());

    // Initialize Pending Subscription data if org has pending subscriptions
    if (SetupWizardService.serviceDataHasBeenInitialized) {
      initializeProvisioningEventHandler();
    } else {
      SetupWizardService.populatePendingSubscriptions().then(function () {
        initializeProvisioningEventHandler();
      });
    }

    vm.statusPageUrl = UrlConfig.getStatusPageUrl();

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded', 'incomingChatTasksLoaded'], function (eventType) {
      $scope.$on(eventType, _.partial(forwardEvent, 'reportDataEventHandler'));
    });

    if (Authinfo.isCare()) {
      SunlightReportService.getOverviewData();
    }

    var params = {
      disableCache: true,
      basicInfo: true,
    };
    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, params);

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    $scope.$on('DISMISS_SIP_NOTIFICATION', function () {
      vm.notifications = _.reject(vm.notifications, {
        name: 'cloudSipUri',
      });
    });

    $scope.$on('Core::ssoCertificateExpirationNotificationDismissed', function () {
      vm.notifications = _.reject(vm.notifications, {
        name: SsoCertExpNotificationService.SSO_CERTIFICATE_NOTIFICATION_NAME,
      });
    });

    $scope.$on('$destroy', function () {
      if (_.isFunction(deregisterSsoEnabledListener)) {
        deregisterSsoEnabledListener();
      }
    });

    var deregisterSsoEnabledListener = $rootScope.$watch('ssoEnabled', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        var params = {
          disableCache: true,
          basicInfo: true,
        };
        Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, params);
      }
    });
  }
})();
