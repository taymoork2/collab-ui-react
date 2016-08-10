(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard(FusionClusterService) {
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
          FusionClusterService.getAll()
            .then(function (clusterList) {
              card.serviceList.push(getStatusForService('squared-fusion-mgmt', clusterList));
              card.serviceList.push(getStatusForService('squared-fusion-cal', clusterList));
              card.serviceList.push(getStatusForService('squared-fusion-uc', clusterList));

              card.enabled = !!_.find(card.serviceList, function (service) {
                return service.setup;
              });
              if (card.enabled) {
                _.each(card.serviceList, function (service) {
                  service.healthStatus = card.serviceStatusToCss[service.status] || card.serviceStatusToCss['unknown'];
                });
              }
            });
        }
        init();

        function getStatusForService(serviceId, clusterList) {
          return {
            serviceId: serviceId,
            setup: FusionClusterService.processClustersToSeeIfServiceIsSetup(serviceId, clusterList),
            status: FusionClusterService.processClustersToAggregateStatusForService(serviceId, clusterList)
          };
        }

        card.serviceStatusToCss = {
          operational: 'success',
          impaired: 'warning',
          outage: 'danger',
          unknown: 'warning'
        };
        return card;
      }
    };
  }
})();
