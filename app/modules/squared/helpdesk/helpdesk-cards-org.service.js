(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskCardsOrgService($translate, CloudConnectorService, Config, FusionClusterService, HelpdeskHuronService, LicenseService, Notification, UCCService) {

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
        aggregatedLicenses: LicenseService.aggregatedLicenses(licenses, Config.licenseTypes.COMMUNICATION),
      };
      HelpdeskHuronService.getOrgSiteInfo(org.id).then(function (site) {
        callCard.voiceMailPrefix = site.siteSteeringDigit + site.siteCode;
        if (_.isEmpty(site.steeringDigit)) {
          callCard.outboundDialDigit = $translate.instant("helpdesk.none");
        } else {
          callCard.outboundDialDigit = site.steeringDigit;
        }
        callCard.routingPrefix = site.routingPrefix;
        callCard.extensionLength = site.extensionLength;
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
      var hybridServiceIds = ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media', 'spark-hybrid-datasecurity'];
      var hybridServicesCard = {
        entitled: _.some(hybridServiceIds, function (serviceId) {
          return LicenseService.orgIsEntitledTo(org, serviceId);
        }) || LicenseService.orgIsEntitledTo(org, 'squared-fusion-gcal') || LicenseService.orgIsEntitledTo(org, 'squared-fusion-ec'),
        services: [],
      };
      if (!hybridServicesCard.entitled) {
        return;
      }
      FusionClusterService.getAll(org.id).then(function (clusterList) {
        _.forEach(hybridServiceIds, function (serviceId) {
          if (LicenseService.orgIsEntitledTo(org, serviceId)) {
            hybridServicesCard.services.push(FusionClusterService.getStatusForService(serviceId, clusterList));
          }
        });
      }).catch(function (response) {
        Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
      });
      if (LicenseService.orgIsEntitledTo(org, 'squared-fusion-gcal')) {
        CloudConnectorService.getService('squared-fusion-gcal', org.id).then(function (service) {
          hybridServicesCard.services.push(service);
        }).catch(function (response) {
          Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
        });
      }
      if (LicenseService.orgIsEntitledTo(org, 'squared-fusion-ec')) {
        UCCService.getOrgVoicemailConfiguration(org.id)
          .then(function (data) {
            hybridServicesCard.services.push({
              serviceId: 'voicemail',
              statusCss: UCCService.mapStatusToCss(data.voicemailOrgEnableInfo.orgVoicemailStatus),
            });
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'helpdesk.hybridVoicemail.cannotReadStatus');
          });
      }
      return hybridServicesCard;
    }

    function getCareCardForOrg(org, licenses) {
      var entitled = LicenseService.orgIsEntitledTo(org, 'cloud-contact-center');
      return new OrgCard(entitled, licenses, Config.licenseTypes.CARE);
    }

    return {
      getMessageCardForOrg: getMessageCardForOrg,
      getMeetingCardForOrg: getMeetingCardForOrg,
      getCallCardForOrg: getCallCardForOrg,
      getHybridServicesCardForOrg: getHybridServicesCardForOrg,
      getRoomSystemsCardForOrg: getRoomSystemsCardForOrg,
      getCareCardForOrg: getCareCardForOrg,
    };
  }

  angular.module('Squared')
    .service('HelpdeskCardsOrgService', HelpdeskCardsOrgService);
}());
