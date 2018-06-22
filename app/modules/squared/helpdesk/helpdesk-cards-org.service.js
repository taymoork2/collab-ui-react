(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCardsOrgService($translate, Config, HelpdeskHuronService, LicenseService) {
    function getMessageCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'webex-squared');
      return new OrgCard(entitled, licenses, [Config.licenseTypes.MESSAGING]);
    }

    function getMeetingCardForOrg(org, licenses) {
      // TODO: Entitlement check? squaredSyncUp || cloudMeetings?
      return new OrgCard(true, licenses, [Config.licenseTypes.CONFERENCING, Config.licenseTypes.CMR]);
    }

    function getCallCardForOrg(org, licenses) {
      var callCard = {
        entitled: LicenseService.orgIsEntitledTo(org, 'ciscouc'),
        aggregatedLicenses: LicenseService.aggregatedLicenses(licenses, [Config.licenseTypes.COMMUNICATION]),
      };
      HelpdeskHuronService.getOrgSiteInfo(org.id).then(function (site) {
        callCard.voiceMailPrefix = site.siteSteeringDigit + site.siteCode;
        if (_.isEmpty(site.steeringDigit)) {
          callCard.outboundDialDigit = $translate.instant('helpdesk.none');
        } else {
          callCard.outboundDialDigit = site.steeringDigit;
        }
        callCard.routingPrefix = site.routingPrefix;
        callCard.extensionLength = site.extensionLength;
      });
      HelpdeskHuronService.getTenantInfo(org.id).then(function (tenant) {
        if (_.isEmpty(tenant.regionCode)) {
          callCard.dialing = $translate.instant('helpdesk.dialingPlan.national');
        } else {
          callCard.dialing = $translate.instant('helpdesk.dialingPlan.local');
          callCard.areaCode = tenant.regionCode;
        }
      });
      return callCard;
    }

    function getRoomSystemsCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'spark-room-system');
      return new OrgCard(entitled, licenses, [Config.licenseTypes.SHARED_DEVICES]);
    }

    function OrgCard(entitled, licenses, licenseTypes) {
      this.entitled = entitled;
      this.aggregatedLicenses = LicenseService.aggregatedLicenses(licenses, licenseTypes);
    }

    function getCareCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'cloud-contact-center');
      return new OrgCard(entitled, licenses, [Config.licenseTypes.CARE]);
    }

    return {
      getMessageCardForOrg: getMessageCardForOrg,
      getMeetingCardForOrg: getMeetingCardForOrg,
      getCallCardForOrg: getCallCardForOrg,
      getRoomSystemsCardForOrg: getRoomSystemsCardForOrg,
      getCareCardForOrg: getCareCardForOrg,
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsOrgService', HelpdeskCardsOrgService);
}());
