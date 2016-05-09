(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCardsUserService(Config, LicenseService) {

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
      }
      if (LicenseService.userIsEntitledTo(user, 'cloudmeetings')) {
        meetingCard.entitled = true;
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
      if (LicenseService.userIsEntitledTo(user, 'meetings')) {
        meetingCard.entitled = true;
        meetingCard.entitlements.push('helpdesk.entitlements.meetings');
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

    return {
      getMessageCardForUser: getMessageCardForUser,
      getMeetingCardForUser: getMeetingCardForUser,
      getCallCardForUser: getCallCardForUser,
      getHybridServicesCardForUser: getHybridServicesCardForUser
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsUserService', HelpdeskCardsUserService);
}());
