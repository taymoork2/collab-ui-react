(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCareCard', OverviewCareCard);

  /* @ngInject */
  function OverviewCareCard(OverviewHelper, Authinfo) {
    return {
      createCard: function createCard() {
        var card = {};
        card.isCSB = Authinfo.isCSB();
        card.template = 'modules/core/overview/genericCard.tpl.html';
        card.icon = 'icon-circle-contact-centre';
        card.desc = 'overview.cards.care.desc';
        card.name = 'overview.cards.care.title';
        card.cardClass = 'cs-card header-bar care-card';
        card.trial = false;
        card.enabled = false;
        card.notEnabledText = 'overview.cards.care.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.helper = OverviewHelper;
        card.showHealth = true;

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SPARK_CARE) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;
          card.trial = _.some(filterLicenses(licenses), 'isTrial');

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
          return _.filter(licenses, function (license) {
            return license.licenseType === 'CARE' && card.helper.isntCancelledOrSuspended(license);
          });
        }
        return card;
      }
    };
  }
})();
