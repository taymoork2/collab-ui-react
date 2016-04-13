(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskCardsOrgService(HelpdeskService, XhrNotificationService, Config, LicenseService) {

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
      return new OrgCard(entitled, licenses, Config.licenseTypes.COMMUNICATION);
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
