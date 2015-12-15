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
        card.enabled = false;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = '#overview';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.helper = OverviewHelper;

        card.hybridStatusEventHandler = function (err, services) {
          card.services = card.filterEnabledServices(card.filterRelevantServices(services));
          card.enabled = !(card.services && (card.services.length === 0 || (card.services.length === 1 && card.services[0].id === "squared-fusion-mgmt")))
          card.populateServicesWithHealth();
        };

        card.adminOrgServiceStatusEventHandler = function (status) {
          card.servicesStatus = status;
          card.populateServicesWithHealth();
        };

        //helpdesk.service.js
        card.filterRelevantServices = function (services) {
          return _.filter(services, function (service) {
            return service.id === 'squared-fusion-cal' || service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec' || service.id ===
              'squared-fusion-mgmt';
          });
        };

        card.filterEnabledServices = function (services) {
          return _.filter(services, function (service) {
            return service.enabled;
          });
        };

        card.populateServicesWithHealth = function () {
          if (card.services) {
            _.each(card.services, function (service) {
              service.healthStatus = serviceStatusToCss[service.status] || serviceStatusToCss['undefined'];
            });
          }
        };

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.CalendarService || component.id === card.helper.statusIds.CloudHybridServicesManagement) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
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
