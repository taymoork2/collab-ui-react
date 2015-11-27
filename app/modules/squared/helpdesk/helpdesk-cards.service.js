(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskCardsService(HelpdeskService, XhrNotificationService, $q, ReportsService, Config, $translate) {

    var healthComponentMapping = {
      message: ['Mobile Clients', 'Rooms', 'Web and Desktop Clients'],
      meeting: ['Media/Calling'],
      call: ['Media/Calling'],
      room: ['Rooms'],
      hybrid: ['Cloud Hybrid Services Management', 'Calendar Service']
    };

    function getMessageCardForUser(user) {
      var messageCard = {
        entitled: false,
        entitlements: []
      };
      var paidOrFree;
      if (userIsEntitledTo(user, 'webex-squared')) {
        messageCard.entitled = true;
        if (userIsEntitledTo(user, 'squared-room-moderation')) {
          paidOrFree = userIsLicensedFor(user, Config.offerCodes.MS) ? 'paid' : 'free';
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
      if (userIsEntitledTo(user, 'squared-syncup')) {
        meetingCard.entitled = true;
        var paidOrFree = userIsLicensedFor(user, Config.offerCodes.CF) ? 'paid' : 'free';
        meetingCard.entitlements.push('helpdesk.entitlements.squared-syncup.' + paidOrFree);
        if (user.licenseID) {
          meetingCard.licensesByWebExSite = _.chain(user.licenseID)
            .map(function (license) {
              return new UserLicense(license);
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
      if (userIsEntitledTo(user, 'ciscouc')) {
        callCard.entitled = true;
        var paidOrFree = userIsLicensedFor(user, Config.offerCodes.CO) ? 'paid' : 'free';
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

    function getMessageCardForOrg(org) {
      var messageCard = {
        entitled: false
      };
      if (orgIsEntitledTo(org, 'webex-squared')) {
        messageCard.entitled = true;
      }
      return messageCard;
    }

    function getMeetingCardForOrg(org) {
      var meetingCard = {
        entitled: true
      };
      return meetingCard;
    }

    function getCallCardForOrg(org) {
      var callCard = {
        entitled: false
      };
      if (orgIsEntitledTo(org, 'ciscouc')) {
        callCard.entitled = true;
      }
      return callCard;
    }

    function getHybridServicesCardForOrg(org) {
      var hybridServicesCard = {
        entitled: false
      };
      if (orgIsEntitledTo(org, 'squared-fusion-mgmt') && (orgIsEntitledTo(org, 'squared-fusion-cal') || orgIsEntitledTo(org, 'squared-fusion-uc'))) {
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

    function getRoomSystemsCardForOrg(org) {
      var roomSystemsCard = {
        entitled: false
      };
      if (orgIsEntitledTo(org, 'spark-device-mgmt')) {
        roomSystemsCard.entitled = true;
      }
      return roomSystemsCard;
    }

    function orgIsEntitledTo(org, entitlement) {
      if (org && org.services) {
        return _.includes(org.services, entitlement);
      }
      return false;
    }

    function getHealthStatuses() {
      var deferred = $q.defer();
      ReportsService.healthMonitor(function (data, status) {
        if (data.success) {
          deferred.resolve(getRelevantHealthStatuses(data.components));
        } else {
          deferred.reject(status);
        }
      });
      return deferred.promise;
    }

    function deduceHealthStatus(statuses) {
      var error = _.find(statuses, function (status) {
        return status === 'error';
      });
      var warning = _.find(statuses, function (status) {
        return status === 'warning';
      });
      var partialOutage = _.find(statuses, function (status) {
        return status === 'partial_outage';
      });
      var operational = _.find(statuses, function (status) {
        return status === 'operational';
      });

      var status = error || warning || partialOutage || operational || 'error';
      return status;
    }

    function getRelevantHealthStatuses(components) {
      var result = {
        message: [],
        meeting: [],
        call: [],
        room: [],
        hybrid: []
      };
      for (var i = 0; i < components.length; i++) {
        if (_.includes(healthComponentMapping.message, components[i].name)) {
          result.message.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.meeting, components[i].name)) {
          result.meeting.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.call, components[i].name)) {
          result.call.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.room, components[i].name)) {
          result.room.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.hybrid, components[i].name)) {
          result.hybrid.push(components[i].status);
        }
      }
      var healthStatuses = {};
      healthStatuses.message = deduceHealthStatus(result.message);
      healthStatuses.meeting = deduceHealthStatus(result.meeting);
      healthStatuses.call = deduceHealthStatus(result.call);
      healthStatuses.room = deduceHealthStatus(result.room);
      healthStatuses.hybrid = deduceHealthStatus(result.hybrid);
      return healthStatuses;
    }

    // E.g. MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com, "MS_62b343df-bdd5-463b-8895-d07fc3a94832"
    function UserLicense(licenseString) {
      var parts = licenseString.split('_');
      this.offerCode = parts[0]; // See Config.offerCodes
      this.id = parts[1];
      if (this.offerCode === Config.offerCodes.MC
        || this.offerCode === Config.offerCodes.SC
        || this.offerCode === Config.offerCodes.TC
        || this.offerCode === Config.offerCodes.EC
        || this.offerCode === Config.offerCodes.EE) {
        this.volume = parts[2];
        this.webExSite = parts[3];
      }
      this.displayName = $translate.instant(Config.confMap[this.offerCode], {
        capacity: this.volume
      })
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
      getHealthStatuses: getHealthStatuses,
      orgIsEntitledTo: orgIsEntitledTo
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsService', HelpdeskCardsService);
}());
