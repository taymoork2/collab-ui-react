require('./_overview.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($rootScope, $state, $scope, Authinfo, CardUtils, CloudConnectorService, Config, FeatureToggleService, HybridServicesClusterService, ProPackService, LearnMoreBannerService, Log, Notification, Orgservice, OverviewCardFactory, OverviewNotificationFactory, ReportsService, HybridServicesFlagService, SunlightReportService, TrialService, UrlConfig, PstnService, HybridServicesUtilsService) {
    var vm = this;

    var PSTN_TOS_ACCEPT = require('modules/huron/pstn/pstnTermsOfService').PSTN_TOS_ACCEPT;
    var PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;

    vm.isCSB = Authinfo.isCSB();
    vm.isDeviceManagement = Authinfo.isDeviceMgmt();
    vm.orgData = null;

    var hybridCallHighAvailability = 'atlas.notification.squared-fusion-uc-high-availability.acknowledged';

    vm.cards = [
      OverviewCardFactory.createMessageCard(),
      OverviewCardFactory.createMeetingCard(),
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
    vm.ftHuronPstn = false;
    vm.ftEnterpriseTrunking = false;

    ////////////////////////////////

    ProPackService.hasProPackEnabledAndNotPurchased().then(function (proPackToggle) {
      if (proPackToggle) {
        $scope.$watch(function () {
          return LearnMoreBannerService.isElementVisible(LearnMoreBannerService.OVERVIEW_LOCATION);
        }, function (visible) {
          vm.showLearnMoreNotification = !visible;
        });
      }
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

      var hybridServiceNotificationFlags = _.chain([
        Config.entitlements.fusion_cal,
        Config.entitlements.fusion_gcal,
        Config.entitlements.fusion_uc,
        Config.entitlements.fusion_ec,
        Config.entitlements.mediafusion,
        Config.entitlements.hds,
      ])
        .filter(Authinfo.isEntitled)
        .map(HybridServicesUtilsService.getAckFlagForHybridServiceId)
        .value();
      hybridServiceNotificationFlags.push(hybridCallHighAvailability);

      HybridServicesFlagService
        .readFlags(hybridServiceNotificationFlags)
        .then(function (flags) {
          _.forEach(flags, function (flag) {
            if (!flag.raised) {
              if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_cal)) {
                vm.notifications.push(OverviewNotificationFactory.createCalendarNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_gcal)) {
                vm.notifications.push(OverviewNotificationFactory.createGoogleCalendarNotification($state, CloudConnectorService, HybridServicesFlagService, HybridServicesUtilsService));
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_uc)) {
                vm.notifications.push(OverviewNotificationFactory.createCallAwareNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.fusion_ec)) {
                vm.notifications.push(OverviewNotificationFactory.createCallConnectNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.mediafusion)) {
                vm.notifications.push(OverviewNotificationFactory.createHybridMediaNotification());
              } else if (flag.name === HybridServicesUtilsService.getAckFlagForHybridServiceId(Config.entitlements.hds)) {
                vm.notifications.push(OverviewNotificationFactory.createHybridDataSecurityNotification());
              } else if (flag.name === hybridCallHighAvailability && Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
                HybridServicesClusterService.serviceIsSetUp('squared-fusion-uc')
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

      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          vm.orgData = data;

          getTOSStatus();
          getEsaDisclaimerStatus();

          if (!data.orgSettings.sipCloudDomain) {
            vm.notifications.push(OverviewNotificationFactory.createCloudSipUriNotification());
          }
          if (vm.isDeviceManagement && _.isUndefined(data.orgSettings.allowCrashLogUpload)) {
            vm.notifications.push(OverviewNotificationFactory.createCrashLogNotification());
          }
          if (Authinfo.isCare() || Authinfo.isCareVoice()) {
            var hasMessage = Authinfo.isMessageEntitled();
            var hasCall = Authinfo.isSquaredUC();
            if (!hasMessage && !hasCall) {
              vm.notifications.push(OverviewNotificationFactory
                .createCareLicenseNotification('homePage.careLicenseMsgAndCallMissingText', 'homePage.careLicenseLinkText'));
            } else if (!hasMessage) {
              vm.notifications.push(OverviewNotificationFactory
                .createCareLicenseNotification('homePage.careLicenseMsgMissingText', 'homePage.careLicenseLinkText'));
            } else if (!hasCall) {
              vm.notifications.push(OverviewNotificationFactory
                .createCareLicenseNotification('homePage.careLicenseCallMissingText', 'homePage.careLicenseLinkText'));
            }
          }
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
          Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
      }, Authinfo.getOrgId(), params);
      Orgservice.getAdminOrgUsage()
        .then(function (response) {
          var sharedDevicesUsage = -1;
          var seaGullsUsage = -1;
          _.each(response.data, function (subscription) {
            _.each(subscription, function (licenses) {
              _.each(licenses, function (license) {
                if (license.status === Config.licenseStatus.ACTIVE) {
                  if (license.offerName === Config.offerCodes.SD) {
                    sharedDevicesUsage = license.usage;
                  } else if (license.offerName === Config.offerCodes.SB) {
                    seaGullsUsage = license.usage;
                  }
                }
              });
            });
          });
          if (sharedDevicesUsage === 0 || seaGullsUsage === 0) {
            setRoomSystemEnabledDevice(true);
            if (sharedDevicesUsage === 0 && seaGullsUsage === 0) {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpDevices'));
            } else if (seaGullsUsage === 0) {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSparkBoardDevices'));
            } else {
              vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSharedDevices'));
            }
          } else {
            setRoomSystemEnabledDevice(false);
          }
        });

      FeatureToggleService.atlasPMRonM2GetStatus().then(function (toggle) {
        if (toggle) {
          vm.notifications.push(OverviewNotificationFactory.createPMRNotification());
        }
      });

      FeatureToggleService.supports(FeatureToggleService.features.huronPstn).then(function (result) {
        vm.ftHuronPstn = result;

        FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking).then(function (result) {
          vm.ftEnterpriseTrunking = result;
          getEsaDisclaimerStatus();
        });
      });

      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        vm.trialDaysLeft = daysLeft;
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
                if (vm.ftHuronPstn) {
                  //This is the new TS version of ToS
                  vm.pstnToSNotification = OverviewNotificationFactory.createPstnTermsOfServiceNotification();
                  vm.notifications.push(vm.pstnToSNotification);
                  $scope.$on(PSTN_TOS_ACCEPT, onPstnToSAccept);
                } else {
                  vm.pstnToSNotification = OverviewNotificationFactory.createPSTNToSNotification();
                  vm.notifications.push(vm.pstnToSNotification);
                  $scope.$on(PSTN_TOS_ACCEPT, onPstnToSAccept);
                }
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
          // c_mgmt will be tested when it will have its own service page back
          var connectorsToTest = ['c_cal', 'c_ucmc'];
          connectorsToTest.forEach(function (connectorType) {
            var hasUrgentUpgrade = _.find(clusters, function (cluster) {
              return _.some(cluster.provisioning, function (p) {
                return p.connectorType === connectorType && p.availablePackageIsUrgent;
              });
            });
            if (hasUrgentUpgrade) {
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

    forwardEvent('licenseEventHandler', Authinfo.getLicenses());

    vm.statusPageUrl = UrlConfig.getStatusPageUrl();

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded', 'incomingChatTasksLoaded'], function (eventType) {
      $scope.$on(eventType, _.partial(forwardEvent, 'reportDataEventHandler'));
    });

    ReportsService.getOverviewMetrics(true);

    SunlightReportService.getOverviewData();

    var params = {
      disableCache: true,
      basicInfo: true,
    };
    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, params);

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    ReportsService.healthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

    init();

    $scope.$on('DISMISS_SIP_NOTIFICATION', function () {
      vm.notifications = _.reject(vm.notifications, {
        name: 'cloudSipUri',
      });
    });

    $rootScope.$watch('ssoEnabled', function (newValue, oldValue) {
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
