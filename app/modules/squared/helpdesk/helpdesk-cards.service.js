(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskCardsService(HelpdeskService, XhrNotificationService, $q, ReportsService, Config, LicenseService) {

    function getMessageCardForUser(user) {
      var messageCard = {
        entitled: false,
        entitlements: []
      };
      var paidOrFree;
      if (LicenseService.userIsEntitledTo(user, 'webex-squared')) {
        messageCard.entitled = true;
        if (LicenseService.userIsEntitledTo(user, 'squared-room-moderation')) {
          paidOrFree = LicenseService.userIsLicensedFor(user, Config.offerCodes.MS) ? 'paid' : 'free';
          messageCard.entitlements.push('helpdesk.entitlements.squared-room-moderation.' + paidOrFree);
        } else {
          messageCard.entitlements.push('helpdesk.entitlements.webex-squared');
        }
      }
      return messageCard;
    }

    function getMeetingCardForUser(user) {
      var meetingCard = {
        entitled: false,
        entitlements: [],
        licensesByWebExSite: {}
      };
      if (LicenseService.userIsEntitledTo(user, 'squared-syncup')) {
        meetingCard.entitled = true;
        var paidOrFree = LicenseService.userIsLicensedFor(user, Config.offerCodes.CF) ? 'paid' : 'free';
        meetingCard.entitlements.push('helpdesk.entitlements.squared-syncup.' + paidOrFree);
        if (user.licenseID) {
          meetingCard.licensesByWebExSite = _.chain(user.licenseID)
            .map(function (license) {
              return new LicenseService.UserLicense(license);
            })
            .filter(function (license) {
              return angular.isDefined(license.webExSite);
            })
            .groupBy('webExSite')
            .value();
        }
      }
      return meetingCard;
    }

    function getCallCardForUser(user) {
      var callCard = {
        entitled: false,
        entitlements: []
      };
      if (LicenseService.userIsEntitledTo(user, 'ciscouc')) {
        callCard.entitled = true;
        var paidOrFree = LicenseService.userIsLicensedFor(user, Config.offerCodes.CO) ? 'paid' : 'free';
        callCard.entitlements.push('helpdesk.entitlements.ciscouc.' + paidOrFree);
      }
      return callCard;
    }

    function getHybridServicesCardForUser(user) {
      var hybridServicesCard = {
        entitled: false,
        cal: {
          entitled: false
        },
        uc: {
          entitled: false
        },
        ec: {
          entitled: false
        }
      };
      if (LicenseService.userIsEntitledTo(user, 'squared-fusion-cal')) {
        hybridServicesCard.entitled = true;
        hybridServicesCard.cal.entitled = true;
      }
      if (LicenseService.userIsEntitledTo(user, 'squared-fusion-uc')) {
        hybridServicesCard.entitled = true;
        hybridServicesCard.uc.entitled = true;

        hybridServicesCard.ec.entitled = LicenseService.userIsEntitledTo(user, 'squared-fusion-ec');
      }
      return hybridServicesCard;
    }

    function getMessageCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'webex-squared');
      return new OrgCard(entitled, licenses, Config.licenseTypes.MESSAGING);
    }

    function getMeetingCardForOrg(org, licenses) {
      // TODO: Entitlement check? squaredSyncUp || cloudMeetings?
      return new OrgCard(true, licenses, Config.licenseTypes.CONFERENCING);
    }

    function getCallCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'ciscouc');
      return new OrgCard(entitled, licenses, Config.licenseTypes.COMMUNICATIONS);
    }

    function getRoomSystemsCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'spark-device-mgmt');
      return new OrgCard(entitled, licenses, Config.licenseTypes.SHARED_DEVICES);
    }

    function OrgCard(entitled, licenses, licenseType) {
      this.entitled = entitled;
      this.licenses = LicenseService.filterLicensesAndSetDisplayName(licenses, licenseType);
      this.isTrial = _.any(this.licenses, {
        'isTrial': true
      });
      this.totalUsage = _.sum(this.licenses, function (license) {
        return license.usage;
      });
      this.totalVolume = _.sum(this.licenses, function (license) {
        return license.volume;
      });
      if (this.totalVolume !== 0) {
        this.usagePercentage = (this.totalUsage * 100) / this.totalVolume;
      } else {
        this.usagePercentage = 0;
      }
    }

    function getHybridServicesCardForOrg(org) {
      var hybridServicesCard = {
        entitled: false
      };
      if (LicenseService.orgIsEntitledTo(org, 'squared-fusion-mgmt') && (LicenseService.orgIsEntitledTo(org, 'squared-fusion-cal') || LicenseService.orgIsEntitledTo(org, 'squared-fusion-uc'))) {
        hybridServicesCard.entitled = true;
        HelpdeskService.getHybridServices(org.id).then(function (services) {
          var enabledHybridServices = _.filter(services, {
            enabled: true
          });
          if (enabledHybridServices.length === 1 && enabledHybridServices[0].id === "squared-fusion-mgmt") {
            enabledHybridServices = []; // Don't show the management service if none of the others are enabled.
          }
          hybridServicesCard.enabledHybridServices = enabledHybridServices;
          hybridServicesCard.availableHybridServices = _.filter(services, {
            enabled: false
          });
        }, XhrNotificationService.notify);
      }
      return hybridServicesCard;
    }

    function getUserCardForOrg(org) {
      var userCard = {
        ssoEnabled: org.ssoEnabled,
        dirsyncEnabled: org.dirsyncEnabled
      };
      LicenseService.getUnlicensedUsersCount(org.id).then(function (licenses) {
        userCard.unlicensedUserCount = licenses;
      }, XhrNotificationService.notify);

      return userCard;
    }

    return {
      getMessageCardForUser: getMessageCardForUser,
      getMeetingCardForUser: getMeetingCardForUser,
      getCallCardForUser: getCallCardForUser,
      getHybridServicesCardForUser: getHybridServicesCardForUser,
      getMessageCardForOrg: getMessageCardForOrg,
      getMeetingCardForOrg: getMeetingCardForOrg,
      getCallCardForOrg: getCallCardForOrg,
      getHybridServicesCardForOrg: getHybridServicesCardForOrg,
      getRoomSystemsCardForOrg: getRoomSystemsCardForOrg,
      getUserCardForOrg: getUserCardForOrg
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsService', HelpdeskCardsService);
}());
