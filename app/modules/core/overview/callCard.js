(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallCard', OverviewCallCard);

  /* @ngInject */
  function OverviewCallCard(OverviewHelper) {
    var card = this;
    this.icon = 'icon-circle-call';
    this.desc = 'overview.cards.call.desc';
    this.name = 'overview.cards.call.title';
    this.cardClass = 'people';
    this.trial = false;
    this.enabled = false;
    this.notEnabledText = 'overview.cards.call.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.settingsUrl = '#/hurondetails/settings';
    this.helper = OverviewHelper;

    this.reportDataEventHandler = function (event, response) {
      if (!response.data.success) return;
      if (event.name == 'oneOnOneCallsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Media/Calling') {
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

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
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
})();
