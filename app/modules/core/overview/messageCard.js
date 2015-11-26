(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewMessageCard', OverviewMessageCard);

  /* @ngInject */
  function OverviewMessageCard(OverviewHelper) {
    var card = this;
    this.icon = 'icon-circle-message';
    this.desc = 'overview.cards.message.desc';
    this.name = 'overview.cards.message.title';
    this.currentTitle = 'overview.cards.message.currentTitle';
    this.previousTitle = 'overview.cards.message.previousTitle';
    this.notEnabledText = 'overview.cards.message.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.trial = false;
    this.enabled = false;
    this.helper = OverviewHelper;

    this.reportDataEventHandler = function (event, response) {

      if (!response.data.success) return;
      if (event.name == 'conversationsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Mobile Clients' || component.name == 'Rooms' || component.name == 'Web and Desktop Clients') {
          card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
        }
      });
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;
      card.trial = _.any(filterLicenses(licenses), {
        'isTrial': true
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

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };

    return card;
  }
})();
