(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard($q, Authinfo, Config, FeatureToggleService, HybridServicesClusterService, CloudConnectorService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = false;
        card.notEnabledAction = 'https://www.cisco.com/go/hybrid-services';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.serviceList = [];

        function init() {
          $q.all({
            nameChangeEnabled: FeatureToggleService.atlas2017NameChangeGetStatus(),
          }).then(function (featureToggles) {
            if (featureToggles.nameChangeEnabled) {
              card.notEnabledText = 'overview.cards.hybrid.notEnabledTextNew';
            } else {
              card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
            }

            return $q.all({
              clusterList: HybridServicesClusterService.getAll(),
              gcalService: Authinfo.isEntitled(Config.entitlements.fusion_google_cal) ? CloudConnectorService.getService() : $q.resolve({}),
              featureToggles: featureToggles,
            });
          }).then(function (response) {
            if (Authinfo.isEntitled(Config.entitlements.fusion_google_cal)) {
              card.serviceList.push(response.gcalService);
            }
            if (Authinfo.isEntitled(Config.entitlements.fusion_cal)) {
              card.serviceList.push(HybridServicesClusterService.getStatusForService('squared-fusion-cal', response.clusterList));
            }
            if (Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
              card.serviceList.push(HybridServicesClusterService.getStatusForService('squared-fusion-uc', response.clusterList));
            }
            if (Authinfo.isEntitled(Config.entitlements.mediafusion)) {
              card.serviceList.push(HybridServicesClusterService.getStatusForService('squared-fusion-media', response.clusterList));
            }
            if (Authinfo.isEntitled(Config.entitlements.hds)) {
              card.serviceList.push(HybridServicesClusterService.getStatusForService('spark-hybrid-datasecurity', response.clusterList));
            }
            if (Authinfo.isEntitled(Config.entitlements.context)) {
              card.serviceList.push(HybridServicesClusterService.getStatusForService('contact-center-context', response.clusterList));
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
          } else if (serviceId === 'spark-hybrid-datasecurity') {
            return 'hds.list';
          } else if (serviceId === 'contact-center-context') {
            return 'context-resources';
          }
        }
        return card;
      },
    };
  }
})();
