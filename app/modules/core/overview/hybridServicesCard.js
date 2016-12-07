(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard($q, Authinfo, Config, FeatureToggleService, FusionClusterService, CloudConnectorService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'header-bar gray-light hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = false;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = 'https://www.cisco.com/go/hybrid-services';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.serviceList = [];

        function init() {
          $q.all({
            hasMediaFeatureToggle: FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceOnboarding),
            hasHDSFeatureToggle: FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity),
            hasGoogleCalendarFeatureToggle: FeatureToggleService.supports(FeatureToggleService.features.atlasHerculesGoogleCalendar),
          }).then(function (featureToggles) {
            return $q.all({
              clusterList: FusionClusterService.getAll(),
              gcalService: Authinfo.isEntitled(Config.entitlements.fusion_google_cal) && featureToggles.hasGoogleCalendarFeatureToggle ? CloudConnectorService.getService('squared-fusion-gcal') : $q.resolve({}),
              featureToggles: featureToggles,
            });
          }).then(function (response) {
            if (response.featureToggles.hasGoogleCalendarFeatureToggle && Authinfo.isEntitled(Config.entitlements.fusion_google_cal)) {
              card.serviceList.push(response.gcalService);
            }
            if (Authinfo.isEntitled(Config.entitlements.fusion_cal)) {
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-cal', response.clusterList));
            }
            if (Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-uc', response.clusterList));
            }
            if (response.featureToggles.hasMediaFeatureToggle && Authinfo.isEntitled(Config.entitlements.mediafusion)) {
              card.serviceList.push(FusionClusterService.getStatusForService('squared-fusion-media', response.clusterList));
            }
            if (response.featureToggles.hasHDSFeatureToggle && Authinfo.isEntitled(Config.entitlements.hds)) {
              card.serviceList.push(FusionClusterService.getStatusForService('spark-hybrid-datasecurity', response.clusterList));
            }
            card.enabled = _.some(card.serviceList, function (service) {
              return service.setup;
            });
            if (card.enabled) {
              _.each(card.serviceList, function (service) {
                service.UIstateLink = getUIStateLink(service.serviceId);
                service.healthStatus = service.statusCss;
              });
            }
          });
        }
        init();

        function getUIStateLink(serviceId) {
          if (serviceId === 'squared-fusion-uc') {
            return 'call-service.list';
          } else if (serviceId === 'squared-fusion-cal') {
            return 'calendar-service.list';
          } else if (serviceId === 'squared-fusion-media') {
            return 'media-service-v2.list';
          } else if (serviceId === 'squared-fusion-gcal') {
            return 'google-calendar-service.settings';
          }
        }
        return card;
      }
    };
  }
})();
