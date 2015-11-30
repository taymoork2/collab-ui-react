(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard(OverviewHelper) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'header-bar cta-base hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = true;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = '#overview';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.helper = OverviewHelper;

        card.hybridStatusEventHandler = function (err, services) {
          card.services = services;
          card.populateServicesWithHealth();
        };

        card.adminOrgServiceStatusEventHandler = function (status) {
          card.servicesStatus = status;
          card.populateServicesWithHealth();
        };

        card.populateServicesWithHealth = function () {
          if (card.services) {
            _.each(card.services, function (service) {
              service.healthStatus = serviceStatusToCss[service.status];
            });
          }
        };

        var serviceStatusToCss = {
          ok: 'success',
          warn: 'warning',
          error: 'danger',
          undefined: 'warning'
        };

        return card;
      }
    };
  }
})();
