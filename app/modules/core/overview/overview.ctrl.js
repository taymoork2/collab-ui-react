(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($rootScope, $scope, $translate, Authinfo, Config, FeatureToggleService, Log, Notification, Orgservice, OverviewCardFactory, OverviewNotificationFactory, ReportsService, ServiceDescriptor, TrialService, UrlConfig) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');
    vm.isCSB = Authinfo.isCSB();
    vm.cards = [
      OverviewCardFactory.createMessageCard(),
      OverviewCardFactory.createMeetingCard(),
      OverviewCardFactory.createCallCard(),
      OverviewCardFactory.createRoomSystemsCard(),
      OverviewCardFactory.createHybridServicesCard(),
      OverviewCardFactory.createUsersCard()
    ];
    vm.notifications = [];
    vm.trialDaysLeft = undefined;
    vm.dismissNotification = dismissNotification;

    vm.hasMediaFeatureToggle = false;

    function isFeatureToggled() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceOnboarding);
    }
    isFeatureToggled().then(function (reply) {
      vm.hasMediaFeatureToggle = reply;
    });

    function init() {
      removeCardUserTitle();
      if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
        vm.notifications.push(OverviewNotificationFactory.createSetupNotification());
      }
      Orgservice.getHybridServiceAcknowledged().then(function (response) {
        if (response.status === 200) {
          angular.forEach(response.data.items, function (item) {
            if (!item.acknowledged) {
              if (item.id === Config.entitlements.fusion_cal) {
                vm.notifications.push(OverviewNotificationFactory.createCalendarNotification());
              } else if (item.id === Config.entitlements.fusion_uc) {
                vm.notifications.push(OverviewNotificationFactory.createCallAwareNotification());
              } else if (item.id === Config.entitlements.fusion_ec) {
                vm.notifications.push(OverviewNotificationFactory.createCallConnectNotification());
              } else if (item.id === Config.entitlements.mediafusion && vm.hasMediaFeatureToggle) {
                vm.notifications.push(OverviewNotificationFactory.createHybridMediaNotification());
              }
            }
          });
        } else {
          Log.error("Error in GET service acknowledged status");
        }
      });
      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          if (!data.orgSettings.sipCloudDomain) {
            vm.notifications.push(OverviewNotificationFactory.createCloudSipUriNotification());
          }
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
          Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
      });
      FeatureToggleService.atlasDarlingGetStatus().then(function (toggle) {
        if (toggle) {
          Orgservice.getAdminOrgUsage()
            .then(function (response) {
              var sharedDevicesUsage = -1;
              var sparkBoardsUsage = -1;
              _.each(response.data, function (subscription) {
                _.each(subscription, function (licenses) {
                  _.each(licenses, function (license) {
                    if (license.status === Config.licenseStatus.ACTIVE) {
                      if (license.offerName === Config.offerCodes.SD) {
                        sharedDevicesUsage = license.usage;
                      } else if (license.offerName === Config.offerCodes.SB) {
                        sparkBoardsUsage = license.usage;
                      }
                    }
                  });
                });
              });
              if (sharedDevicesUsage === 0 || sparkBoardsUsage === 0) {
                setEnableDevice(true);
                if (sharedDevicesUsage === 0 && sparkBoardsUsage === 0) {
                  vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpDevices'));
                } else if (sparkBoardsUsage === 0) {
                  vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSparkBoardDevices'));
                } else {
                  vm.notifications.push(OverviewNotificationFactory.createDevicesNotification('homePage.setUpSharedDevices'));
                }
              } else {
                setEnableDevice(false);
              }
            });
        }
      });
      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        vm.trialDaysLeft = daysLeft;
      });
    }

    function removeCardUserTitle() {
      if (vm.isCSB) {
        _.remove(vm.cards, {
          name: 'overview.cards.users.title'
        });
      }
    }

    function setEnableDevice(deviceEnabled) {
      (_.find(vm.cards, function (card) {
        return card.name === 'overview.cards.roomSystem.title';
      })).isDeviceEnabled = deviceEnabled;
    }

    function dismissNotification(notification) {
      vm.notifications = _.reject(vm.notifications, {
        name: notification.name
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

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded'], function (eventType) {
      $scope.$on(eventType, _.partial(forwardEvent, 'reportDataEventHandler'));
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, true);

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    ReportsService.healthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

    ServiceDescriptor.services(_.partial(forwardEvent, 'hybridStatusEventHandler'), true);

    init();

    $scope.$on('DISMISS_SIP_NOTIFICATION', function () {
      vm.notifications = _.reject(vm.notifications, {
        name: 'cloudSipUri'
      });
    });

    $rootScope.$watch('ssoEnabled', function () {
      Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, true);
    });
  }
})();
