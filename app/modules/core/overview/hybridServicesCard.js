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
        card.cardClass = 'header-bar gray-light hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = false;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = 'https://www.cisco.com/go/hybrid-services';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.helper = OverviewHelper;
        card.showHealth = true;

        card.hybridStatusEventHandler = function (err, services) {
          card.services = card.filterEnabledServices(card.filterRelevantServices(services));
          card.enabled = !(card.services && (card.services.length === 0 || (card.services.length === 1 && card.services[0].id === "squared-fusion-mgmt")));
          card.populateServicesWithHealth();
        };

        //helpdesk.service.js and modified to concatenate call services.
        card.filterRelevantServices = function (services) {
          var callServices = _.filter(services, function (service) {
            return service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec';
          });
          var filteredServices = _.filter(services, function (service) {
            return service.id === 'squared-fusion-cal' || service.id === 'squared-fusion-mgmt' || service.id === 'squared-fusion-media';
          });
          if (callServices.length > 0) {
            var callService = {
              id: "squared-fusion-uc",
              enabled: _.all(callServices, {
                enabled: true
              }),
              status: _.reduce(callServices, function (result, serv) {
                return card.serviceStatusWeight[serv.status] > card.serviceStatusWeight[result] ? serv.status : result;
              }, "ok")
            };
            filteredServices.push(callService);
          }

          return filteredServices;
        };

        card.filterEnabledServices = function (services) {
          return _.filter(services, function (service) {
            return service.enabled;
          });
        };

        card.populateServicesWithHealth = function () {
          if (card.services) {
            _.each(card.services, function (service) {
              service.healthStatus = card.serviceStatusToCss[service.status] || card.serviceStatusToCss['undefined'];
            });
          }
        };

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkHybridServices) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
        };

        card.serviceStatusToCss = {
          ok: 'success',
          warn: 'warning',
          error: 'danger',
          undefined: 'warning'
        };
        card.serviceStatusWeight = {
          ok: 1,
          warn: 2,
          error: 3,
          undefined: 0
        };

        return card;
      }
    };
  }
})();
