(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallCard', OverviewCallCard);

  /* @ngInject */
  function OverviewCallCard(OverviewHelper, Authinfo, FeatureToggleService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.template = 'modules/core/overview/genericCard.tpl.html';
        card.icon = 'icon-circle-call';
        card.desc = 'overview.cards.call.desc';
        card.name = 'overview.cards.call.title';
        card.cardClass = 'cs-card header-bar cta-base';
        card.trial = false;
        card.enabled = false;
        card.notEnabledText = 'overview.cards.call.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.settingsUrl = '#/hurondetails/settings';
        card.helper = OverviewHelper;
        card.showHealth = true;
        card.isCSB = false;

        FeatureToggleService.supports(FeatureToggleService.features.atlasTelstraCsb).then(function (result) {
          card.isCSB = Authinfo.isCSB() && result;
        });

        card.reportDataEventHandler = function (event, response) {
          if (!response.data.success) return;
          if (event.name == 'oneOnOneCallsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
            card.current = Math.round(response.data.data[response.data.data.length - 1].count);
            card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
          }
        };

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkCall) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;

          card.trial = _.any(filterLicenses(licenses), {
            'isTrial': true
          });

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (l) {
            //  return l.offerName === 'CO'
            return l.licenseType === 'COMMUNICATION' && card.helper.isntCancelledOrSuspended(l);
          });
        }

        return card;
      }
    };
  }
})();
