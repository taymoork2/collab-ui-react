require('./_overview.scss');
var SsoCertExpNotificationService = require('modules/core/overview/notifications/ssoCertificateExpirationNotification.service').SsoCertificateExpirationNotificationService;

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($q,
    $rootScope,
    $scope,
    $state,
    Authinfo,
    AutoAssignTemplateService,
    CardUtils,
    CloudConnectorService,
    Config,
    EvaService,
    FeatureToggleService,
    HybridServicesClusterService,
    HybridServicesFlagService,
    HybridServicesUtilsService,
    LearnMoreBannerService,
    LinkedSitesService,
    Log, Notification,
    Orgservice,
    OverviewCardFactory,
    OverviewNotificationFactory,
    PrivateTrunkService,
    ProPackService,
    PstnService,
    ReportsService,
    ServiceDescriptorService,
    SetupWizardService,
    SsoCertificateExpirationNotificationService,
    SsoCertificateService,
    SubscriptionWithUnsyncedLicensesNotificationService,
    SunlightReportService,
    SunlightUtilitiesService,
    TrialService,
    UrlConfig,
    WebExSiteService) {
    var vm = this;
    var PSTN_TOS_ACCEPT = require('modules/huron/pstn/pstnTermsOfService').PSTN_TOS_ACCEPT;
    var PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;

    var proPackPurchased = false;

    vm.isCSB = Authinfo.isCSB();
    vm.isDeviceManagement = Authinfo.isDeviceMgmt();
    vm.orgData = null;
    vm.atlasF3745AutoAssignLicensesToggle = false;

    var hybridCallHighAvailability = 'atlas.notification.squared-fusion-uc-high-availability.acknowledged';
    var allHybridCalendarsNotification = 'atlas.notification.squared-fusion-all-calendars.acknowledged';

    vm.cards = [
      OverviewCardFactory.createMessageCard(),
      OverviewCardFactory.createMeetingCard($scope),
      OverviewCardFactory.createCallCard(),
      OverviewCardFactory.createCareCard(),
      OverviewCardFactory.createRoomSystemsCard(),
      OverviewCardFactory.createHybridServicesCard(),
      OverviewCardFactory.createUsersCard(),
    ];

    vm.notifications = [];
    vm.pstnToSNotification = null;
    vm.esaDisclaimerNotification = null;
    vm.trialDaysLeft = undefined;
    vm.isEnterpriseCustomer = isEnterpriseCustomer;
    vm.dismissNotification = dismissNotification;
    vm.notificationComparator = notificationComparator;
    vm.ftEnterpriseTrunking = false;
    vm.showUserTaskManagerModal = showUserTaskManagerModal;

    ////////////////////////////////

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
      var v1 = _.toLower(_.last(_.split(a.value, '.')));
      var v2 = _.toLower(_.last(_.split(b.value, '.')));
      if (_.isEqual(v1, v2)) {
        return 0;
      } else {
        return (_.indexOf(notificationOrder, v1) < _.indexOf(notificationOrder, v2)) ? -1 : 1;
      }
    }

    // for smaller screens where the notifications are on top, the layout needs to resize after the notifications are loaded
    function resizeNotifications() {
      CardUtils.resize(0, '.fourth.cs-card-layout');
    }

    function init() {
      findAnyUrgentUpgradeInHybridServices();
      removeCardUserTitle();
      if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
        vm.notifications.push(OverviewNotificationFactory.createSetupNotification());
        resizeNotifications();
      }

      LinkedSitesService.linkedSitesNotConfigured().then(function (showNotification) {
        if (showNotification === true) {
          vm.notifications.push(OverviewNotificationFactory.createLinkedSitesNotification($state));
          resizeNotifications();
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
                      vm.notifications.push(OverviewNotificationFactory.createCalendarNotification());
                      resizeNotifications();
                    }
                  });
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_gcal)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasOffice365Support)
                  .then(function (supported) {
                    if (!supported) {
                      vm.notifications.push(OverviewNotificationFactory.createGoogleCalendarNotification($state, CloudConnectorService, HybridServicesFlagService, HybridServicesUtilsService));
                      resizeNotifications();
                    }
                  });
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_uc)) {
                vm.notifications.push(OverviewNotificationFactory.createCallAwareNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_ec)) {
                vm.notifications.push(OverviewNotificationFactory.createCallConnectNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.mediafusion)) {
                vm.notifications.push(OverviewNotificationFactory.createHybridMediaNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.hds) && proPackPurchased) {
                vm.notifications.push(OverviewNotificationFactory.createHybridDataSecurityNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.imp)) {
                FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp)
                  .then(function (supported) {
                    if (supported) {
                      vm.notifications.push(OverviewNotificationFactory.createHybridMessagingNotification($state, HybridServicesFlagService, HybridServicesUtilsService));
                      resizeNotifications();
                    }
                  });
              } else if (flag.name === hybridCallHighAvailability && Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
                ServiceDescriptorService.isServiceEnabled('squared-fusion-uc')
                  .then(function (isSetup) {
                    if (isSetup) {
                      return HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
                        .then(function (serviceHasHA) {
                          if (!serviceHasHA) {
                            vm.notifications.push(OverviewNotificationFactory.createCallServiceHighAvailability());
                            resizeNotifications();
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
                          vm.notifications.push(allHybridCalendarsNotification);
                          resizeNotifications();
                        });
                    }
                  });
              }
            }
          });
          resizeNotifications();
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
          vm.notifications.push(OverviewNotificationFactory.createCloudSipUriNotification());
        }
        if (vm.isDeviceManagement && _.isUndefined(_.get(vm.orgData, 'orgSettings.allowCrashLogUpload'))) {
          vm.notifications.push(OverviewNotificationFactory.createCrashLogNotification());
        }
        if (Authinfo.isCare() || Authinfo.isCareVoice()) {
          var hasMessage = Authinfo.isMessageEntitled();
          var hasCall = Authinfo.hasCallLicense();
          if (!hasMessage && !hasCall) {
            vm.notifications.push(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseMsgAndCallMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasMessage) {
            vm.notifications.push(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseMsgMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasCall && !vm.careToggle) {
            vm.notifications.push(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseCallMissingText', 'homePage.careLicenseLinkText'));
          } else if (!hasCall && (!vm.pt && !vm.ept) && vm.careToggle) {
            vm.notifications.push(OverviewNotificationFactory
              .createCareLicenseNotification('homePage.careLicenseCallMissingTextToggle', 'careChatTpl.learnMoreLink', FeatureToggleService));
          }
        }

        checkForUnsyncedSubscriptionLicenses();
        checkForSsoCertificateExpiration(response.isAtlasSsoCertificateUpdateToggled);
      }).catch(function (response) {
        Notification.errorWithTrackingId(response, 'firstTimeWizard.sparkDomainManagementServiceErrorMessage');
      });
      Orgservice.getLicensesUsage()
        .then(function (subscriptions) {
          var activeLicenses = _.filter(_.flatMap(subscriptions, 'licenses'), ['status', Config.licenseStatus.ACTIVE]);
          var sharedDeviceLicenses = _.filter(activeLicenses, ['offerName', Config.offerCodes.SD]);
          var sharedDevicesUsage = _.sumBy(sharedDeviceLicenses, 'usage');
          var showSharedDevicesNotification = sharedDeviceLicenses.length > 0 && sharedDevicesUsage === 0;
          var sparkBoardLicenses = _.filter(activeLicenses, ['offerName', Config.offerCodes.SB]);
          var sparkBoardUsage = _.sumBy(sparkBoardLicenses, 'usage');
          var showSparkBoardNotification = sparkBoardLicenses.length > 0 && sparkBoardUsage === 0;
          if (showSharedDevicesNotification || showSparkBoardNotification) {
            setRoomSystemEnabledDevice(true);
            if (showSharedDevicesNotification && showSparkBoardNotification) {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpDevices'));
            } else if (showSparkBoardNotification) {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSparkBoardDevices'));
            } else {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSharedDevices'));
            }
          } else {
            setRoomSystemEnabledDevice(false);
          }
        });

      FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking).then(function (result) {
        vm.ftEnterpriseTrunking = result;
        getEsaDisclaimerStatus();
      });

      FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus().then(function (toggle) {
        vm.atlasF3745AutoAssignLicensesToggle = toggle;
        if (toggle) {
          AutoAssignTemplateService.hasDefaultTemplate().then(function (hasDefaultTemplate) {
            if (!hasDefaultTemplate) {
              vm.notifications.push(OverviewNotificationFactory.createAutoAssignNotification());
            }
          });
        }
      });

      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        vm.trialDaysLeft = daysLeft;
      });
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
                  vm.notifications.push(OverviewNotificationFactory.createEvaMissingDefaultSpaceNotification($state, eva, linkText, text, owner));
                  resizeNotifications();
                }
              });
          }
        });
    }

    if (Authinfo.isCare() && Authinfo.isCustomerAdmin()) {
      SunlightUtilitiesService.isCareSetup().then(function (isOrgOnboarded) {
        if (!isOrgOnboarded && SunlightUtilitiesService.showSetUpCareNotification()) {
          vm.notifications.push(OverviewNotificationFactory.createCareNotSetupNotification());
          resizeNotifications();
        }
      });
    }

    function checkForUnsyncedSubscriptionLicenses() {
      WebExSiteService.findSubscriptionsWithUnsyncedLicenses().then(function (results) {
        _.forEach(results, function (unsyncedSubscription) {
          vm.notifications.push(SubscriptionWithUnsyncedLicensesNotificationService.createNotification(unsyncedSubscription));
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
            vm.notifications.push(SsoCertificateExpirationNotificationService.createNotification(daysDiff));
            resizeNotifications();
          }
        });
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
                vm.notifications.push(vm.pstnToSNotification);
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
            vm.notifications.push(vm.esaDisclaimerNotification);
            $scope.$on(PSTN_ESA_DISCLAIMER_ACCEPT, onPstnEsaDisclaimerAccept);
          }
        });
      }
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
              vm.notifications.push(OverviewNotificationFactory.createUrgentUpgradeNotification(connectorType));
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

    function setRoomSystemEnabledDevice(isDeviceEnabled) {
      (_.find(vm.cards, function (card) {
        return card.name === 'overview.cards.roomSystem.title';
      })).isDeviceEnabled = isDeviceEnabled;
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

    ReportsService.getOverviewMetrics(true);

    if (Authinfo.isCare()) {
      SunlightReportService.getOverviewData();
    }

    var params = {
      disableCache: true,
      basicInfo: true,
    };
    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, params);

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    ReportsService.healthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

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
