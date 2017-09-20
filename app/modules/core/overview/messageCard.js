(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var genericCardTemplatePath = require('ngtemplate-loader?module=Core!./genericCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewMessageCard', OverviewMessageCard);

  /* @ngInject */
  function OverviewMessageCard(OverviewHelper) {
    return {
      createCard: function createCard() {
        var card = {};
        card.template = genericCardTemplatePath;
        card.icon = 'icon-circle-message';
        card.desc = 'overview.cards.message.desc';
        card.name = 'overview.cards.message.title';
        card.currentTitle = 'overview.cards.message.currentTitle';
        card.previousTitle = 'overview.cards.message.previousTitle';
        card.notEnabledText = 'overview.cards.message.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.trial = false;
        card.enabled = false;
        card.cardClass = 'cs-card';
        card.helper = OverviewHelper;
        card.showHealth = true;

        card.reportDataEventHandler = function (event, response) {
          if (!response.data.success) return;
          if (event.name == 'conversationsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
            card.current = Math.round(response.data.data[response.data.data.length - 1].count);
            card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
          }
        };

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkMessage) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
              card.healthStatusAria = card.helper.mapStatusAria(card.healthStatus, component.status);
            }
          });
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;
          card.trial = _.some(filterLicenses(licenses), {
            isTrial: true,
          });

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (l) {
            return l.licenseType === 'MESSAGING' && card.helper.isntCancelledOrSuspended(l);
          });
        }

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };

        return card;
      },
    };
  }
})();
