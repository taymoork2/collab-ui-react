(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCardsOrgService($translate, Config, HelpdeskHuronService, LicenseService, Notification, FusionClusterService) {

    function getMessageCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'webex-squared');
      return new OrgCard(entitled, licenses, Config.licenseTypes.MESSAGING);
    }

    function getMeetingCardForOrg(org, licenses) {
      // TODO: Entitlement check? squaredSyncUp || cloudMeetings?
      return new OrgCard(true, licenses, Config.licenseTypes.CONFERENCING);
    }

    function getCallCardForOrg(org, licenses) {
      var callCard = {
        entitled: LicenseService.orgIsEntitledTo(org, 'ciscouc'),
        aggregatedLicenses: LicenseService.aggregatedLicenses(licenses, Config.licenseTypes.COMMUNICATION)
      };
      HelpdeskHuronService.getOrgSiteInfo(org.id).then(function (site) {
        callCard.voiceMailPrefix = site.siteSteeringDigit + site.siteCode;
        callCard.outboundDialDigit = site.steeringDigit;
      });
      HelpdeskHuronService.getTenantInfo(org.id).then(function (tenant) {
        if (_.isEmpty(tenant.regionCode)) {
          callCard.dialing = $translate.instant("helpdesk.dialingPlan.national");
        } else {
          callCard.dialing = $translate.instant("helpdesk.dialingPlan.local");
          callCard.areaCode = tenant.regionCode;
        }
      });
      return callCard;
    }

    function getRoomSystemsCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'spark-room-system');
      return new OrgCard(entitled, licenses, Config.licenseTypes.SHARED_DEVICES);
    }

    function OrgCard(entitled, licenses, licenseType) {
      this.entitled = entitled;
      this.aggregatedLicenses = LicenseService.aggregatedLicenses(licenses, licenseType);
    }

    function getHybridServicesCardForOrg(org) {
      var hybridServicesCard = {
        entitled: false
      };
      FusionClusterService.getAll(org.id).then(function (clusterList) {
        hybridServicesCard.services = [];
        _.forEach(['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media', 'spark-hybrid-datasecurity'], function (serviceId) {
          if (LicenseService.orgIsEntitledTo(org, serviceId)) {
            hybridServicesCard.services.push(FusionClusterService.getStatusForService(serviceId, clusterList));
          }
        });
        hybridServicesCard.entitled = _.size(hybridServicesCard.services) > 0;
      }).catch(function (response) {
        Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
      });
      return hybridServicesCard;
    }

    return {
      getMessageCardForOrg: getMessageCardForOrg,
      getMeetingCardForOrg: getMeetingCardForOrg,
      getCallCardForOrg: getCallCardForOrg,
      getHybridServicesCardForOrg: getHybridServicesCardForOrg,
      getRoomSystemsCardForOrg: getRoomSystemsCardForOrg
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsOrgService', HelpdeskCardsOrgService);
}());
