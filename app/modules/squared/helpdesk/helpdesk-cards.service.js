(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskCardsService() {

    function getMessageCardForUser(user) {
      var messageCard = {
        entitled: false,
        entitlements: []
      };
      var paidOrFree;
      if (userIsEntitledTo(user, 'webex-squared')) {
        messageCard.entitled = true;
        if (userIsEntitledTo(user, 'squared-room-moderation')) {
          paidOrFree = userIsLicensedFor(user, 'MS') ? 'paid' : 'free';
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
        entitlements: []
      };
      if (userIsEntitledTo(user, 'squared-syncup')) {
        meetingCard.entitled = true;
        var paidOrFree = userIsLicensedFor(user, 'CF') ? 'paid' : 'free';
        meetingCard.entitlements.push('helpdesk.entitlements.squared-syncup.' + paidOrFree);
      }
      return meetingCard;
    }

    function getCallCardForUser(user) {
      var callCard = {
        entitled: false,
        entitlements: []
      };
      if (userIsEntitledTo(user, 'ciscouc')) {
        callCard.entitled = true;
        var paidOrFree = userIsLicensedFor(user, 'CO') ? 'paid' : 'free';
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
      if (userIsEntitledTo(user, 'squared-fusion-cal')) {
        hybridServicesCard.entitled = true;
        hybridServicesCard.cal.entitled = true;
      }
      if (userIsEntitledTo(user, 'squared-fusion-uc')) {
        hybridServicesCard.entitled = true;
        hybridServicesCard.uc.entitled = true;
        hybridServicesCard.ec.entitled = userIsEntitledTo(user, 'squared-fusion-ec');
      }
      return hybridServicesCard;
    }

    function userIsEntitledTo(user, entitlement) {
      if (user && user.entitlements) {
        return _.includes(user.entitlements, entitlement);
      }
      return false;
    }

    function userIsLicensedFor(user, licensePrefix) {
      if (user && user.licenseID) {
        var userLicenses = user.licenseID;
        for (var l = userLicenses.length - 1; l >= 0; l--) {
          var prefix = userLicenses[l].substring(0, 2);
          if (prefix === licensePrefix) {
            return true;
          }
        }
      }
      return false;
    }

    return {
      getMessageCardForUser: getMessageCardForUser,
      getMeetingCardForUser: getMeetingCardForUser,
      getCallCardForUser: getCallCardForUser,
      getHybridServicesCardForUser: getHybridServicesCardForUser
    };

  }

  angular.module('Squared')
    .service('HelpdeskCardsService', HelpdeskCardsService);
}());
